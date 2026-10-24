import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { unlinkSync, existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

vi.mock("@/lib/session", () => ({
  getCurrentUser: async () => mockSession.value,
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url) => {
    const err = new Error(`REDIRECT:${url}`);
    err.isRedirect = true;
    throw err;
  },
}));

const mockSession = vi.hoisted(() => ({ value: null }));
const as = (u) => {
  mockSession.value = u;
};

const dbFile = join(tmpdir(), `tori-monitoring3-test-${process.pid}.db`);
process.env.DATABASE_URL = `file:${dbFile}`;

let prisma;
let placeBidAction;
let settleExpiredAuctions;
let completeAuctionIfNeeded;
let getSellerAnalytics;
let createAuditLog;
let getAuditLogs;
let getSuspiciousBiddingFlags;
let isEmailConfigured;
let sendEmail;
let adminAccessCheck;

let sellerA;
let sellerB;
let buyer1;
let buyer2;
let category;
let activeLot;
let endedLot;

const H = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012";

beforeAll(async () => {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const setup = new Database(dbFile);
  try {
    const migrations = [
      "20260910103445_init",
      "20260910114613_phase5_watchlist_notifications",
      "20261010_password_reset_token",
      "20261023_audit_log_and_images",
    ];
    for (const m of migrations) {
      setup.exec(
        readFileSync(join(repoRoot, "prisma", "migrations", m, "migration.sql"), "utf8")
      );
    }
  } finally {
    setup.close();
  }

  vi.resetModules();
  ({ prisma } = await import("@/lib/prisma.js"));
  ({ placeBidAction } = await import("@/lib/auction-actions.js"));
  ({ settleExpiredAuctions, completeAuctionIfNeeded } = await import("@/lib/auctions.js"));
  ({ getSellerAnalytics } = await import("@/lib/seller-analytics.js"));
  ({ createAuditLog, getAuditLogs, getSuspiciousBiddingFlags } = await import("@/lib/audit.js"));
  ({ isEmailConfigured, sendEmail } = await import("@/lib/email.js"));
  ({ adminAccessCheck } = await import("@/lib/admin-actions.js"));

  // Seed baseline users
  sellerA = await prisma.user.create({
    data: { name: "Seller Alpha", email: "sellerA@tori.local", password: H, role: "SELLER" },
  });
  sellerB = await prisma.user.create({
    data: { name: "Seller Beta", email: "sellerB@tori.local", password: H, role: "SELLER" },
  });
  buyer1 = await prisma.user.create({
    data: { name: "Buyer One", email: "buyer1@tori.local", password: H, role: "BUYER" },
  });
  buyer2 = await prisma.user.create({
    data: { name: "Buyer Two", email: "buyer2@tori.local", password: H, role: "BUYER" },
  });

  category = await prisma.category.create({
    data: { name: "Horology", slug: "horology" },
  });

  const now = Date.now();
  activeLot = await prisma.auction.create({
    data: {
      title: "Rolex Submariner 1982",
      description: "Vintage reference 16800 in unpolished stainless steel condition.",
      startingPrice: 10000,
      currentPrice: 10000,
      minimumIncrement: 1000,
      startTime: new Date(now - 3600_000),
      endTime: new Date(now + 3600_000),
      status: "ACTIVE",
      sellerId: sellerA.id,
      categoryId: category.id,
    },
  });

  endedLot = await prisma.auction.create({
    data: {
      title: "Omega Speedmaster 1969",
      description: "Moonwatch vintage manual-wind chronograph.",
      startingPrice: 5000,
      currentPrice: 5000,
      minimumIncrement: 500,
      startTime: new Date(now - 7200_000),
      endTime: new Date(now - 3600_000),
      status: "ACTIVE", // marked ACTIVE in DB but past endTime
      sellerId: sellerA.id,
      categoryId: category.id,
    },
  });
});

afterAll(async () => {
  try {
    if (prisma) await prisma.$disconnect();
    if (existsSync(dbFile)) unlinkSync(dbFile);
  } catch {
    // Ignore
  }
});

describe("Monitoring-III: Real-Time Bidding & Concurrency Safety", () => {
  it("rejects unauthenticated bidding attempts", async () => {
    as(null);
    const res = await placeBidAction(activeLot.id, 11000);
    expect(res.error).toMatch(/sign in/i);
    expect(res.code).toBe("UNAUTHENTICATED");
  });

  it("rejects bids below the minimum increment", async () => {
    as(buyer1);
    const res = await placeBidAction(activeLot.id, 10500); // minimum is 11000
    expect(res.error).toMatch(/must be at least/i);
  });

  it("accepts a valid authenticated bid and updates highest price", async () => {
    as(buyer1);
    const res = await placeBidAction(activeLot.id, 11000);
    expect(res.ok).toBe(true);
    expect(res.amount).toBe(11000);

    const updated = await prisma.auction.findUnique({ where: { id: activeLot.id } });
    expect(updated.currentPrice).toBe(11000);
  });

  it("handles concurrent bids: rejects a stale or identical bid once a higher bid has committed", async () => {
    as(buyer2);
    // buyer2 places a higher bid of 15000
    const resHigh = await placeBidAction(activeLot.id, 15000);
    expect(resHigh.ok).toBe(true);

    // buyer1 tries to submit 12000 (which is now below minimum)
    as(buyer1);
    const resStale = await placeBidAction(activeLot.id, 12000);
    expect(resStale.error).toMatch(/must be at least/i);

    // Simultaneous identical bids: only one can succeed
    const [res1, res2] = await Promise.all([
      (async () => { as(buyer1); return placeBidAction(activeLot.id, 17000); })(),
      (async () => { as(buyer2); return placeBidAction(activeLot.id, 17000); })(),
    ]);
    const successes = [res1, res2].filter((r) => r.ok);
    const failures = [res1, res2].filter((r) => r.error);
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);
  });

  it("records an audit log for every committed bid", async () => {
    const logs = await getAuditLogs({ action: "BID_PLACED" });
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs[0].entityType).toBe("Auction");
  });
});

describe("Monitoring-III: Auction Lifecycle & Settlement Idempotency", () => {
  it("rejects bids on ended auctions", async () => {
    as(buyer1);
    const res = await placeBidAction(endedLot.id, 6000);
    expect(res.error).toMatch(/already ended/i);
  });

  it("idempotently settles expired auctions without duplicate notifications", async () => {
    // Place a bid on endedLot before settlement to test winner resolution
    await prisma.bid.create({
      data: {
        amount: 8000,
        auctionId: endedLot.id,
        bidderId: buyer1.id,
      },
    });

    // Run 1st settlement
    const firstSettlement = await settleExpiredAuctions();
    expect(firstSettlement.count).toBeGreaterThanOrEqual(1);

    const notifCountAfterFirst = await prisma.notification.count({
      where: { referenceId: endedLot.id },
    });
    expect(notifCountAfterFirst).toBeGreaterThanOrEqual(1);

    // Run 2nd settlement immediately (idempotency check)
    const secondSettlement = await settleExpiredAuctions();
    expect(secondSettlement.count).toBe(0);

    const notifCountAfterSecond = await prisma.notification.count({
      where: { referenceId: endedLot.id },
    });
    expect(notifCountAfterSecond).toBe(notifCountAfterFirst); // zero duplicate notifications
  });
});

describe("Monitoring-III: Seller Analytics Data Isolation", () => {
  it("strictly isolates seller metrics to the authenticated seller", async () => {
    const analyticsA = await getSellerAnalytics(sellerA.id);
    const analyticsB = await getSellerAnalytics(sellerB.id);

    expect(analyticsA.totalListings).toBe(2);
    expect(analyticsA.totalBidsReceived).toBeGreaterThanOrEqual(2);

    // Seller B has 0 listings
    expect(analyticsB.totalListings).toBe(0);
    expect(analyticsB.totalBidsReceived).toBe(0);
    expect(analyticsB.listingsPerformance).toHaveLength(0);
  });
});

describe("Monitoring-III: Email Service & Fallback Boundary", () => {
  it("reports configuration status and suppresses delivery when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    expect(isEmailConfigured()).toBe(false);

    const res = await sendEmail({
      to: "collector@example.com",
      subject: "Test Auction",
      html: "<p>Test</p>",
      text: "Test",
    });

    expect(res.success).toBe(false);
    expect(res.configured).toBe(false);
    expect(res.reason).toMatch(/RESEND_API_KEY/i);
  });
});

describe("Monitoring-III: Admin Authorization & Anomaly Detection", () => {
  it("rejects non-admin users from adminAccessCheck", async () => {
    as(buyer1);
    await expect(adminAccessCheck()).rejects.toThrow(/REDIRECT:\/unauthorized/);
  });

  it("detects rapid bidding patterns in getSuspiciousBiddingFlags", async () => {
    // Generate rapid simulated bids within 10 seconds on activeLot
    const now = new Date();
    await prisma.bid.createMany({
      data: [
        { amount: 16000, auctionId: activeLot.id, bidderId: buyer1.id, createdAt: now },
        { amount: 17000, auctionId: activeLot.id, bidderId: buyer1.id, createdAt: now },
        { amount: 18000, auctionId: activeLot.id, bidderId: buyer1.id, createdAt: now },
      ],
    });

    const flags = await getSuspiciousBiddingFlags();
    expect(flags.length).toBeGreaterThanOrEqual(1);
    expect(flags.some((f) => f.userId === buyer1.id)).toBe(true);
  });
});
