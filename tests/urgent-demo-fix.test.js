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
    err.url = url;
    throw err;
  },
}));

const mockSession = vi.hoisted(() => ({ value: null }));
const as = (u) => {
  mockSession.value = u;
};

const dbFile = join(tmpdir(), `tori-urgent-demo-${process.pid}.db`);
process.env.DATABASE_URL = `file:${dbFile}`;

let prisma;
let createAuctionAction;
let placeBidAction;
let getAuctions;
let getAuctionById;
let ensureDemoLotsActive;

let seller;
let buyer;
let category;

const HASH = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012";

beforeAll(async () => {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const setup = new Database(dbFile);
  try {
    for (const m of [
      "20260910103445_init",
      "20260910114613_phase5_watchlist_notifications",
      "20261010_password_reset_token",
      "20261023_audit_log_and_images",
    ]) {
      setup.exec(
        readFileSync(join(repoRoot, "prisma", "migrations", m, "migration.sql"), "utf8")
      );
    }
  } finally {
    setup.close();
  }

  const pMod = await import("@/lib/prisma");
  prisma = pMod.prisma;

  const actMod = await import("@/lib/auction-actions");
  createAuctionAction = actMod.createAuctionAction;
  placeBidAction = actMod.placeBidAction;

  const aucMod = await import("@/lib/auctions");
  getAuctions = aucMod.getAuctions;
  getAuctionById = aucMod.getAuctionById;

  const demoMod = await import("@/lib/demo-mode");
  ensureDemoLotsActive = demoMod.ensureDemoLotsActive;

  seller = await prisma.user.create({
    data: { name: "Demo Seller", email: "demoseller@tori.local", password: HASH, role: "SELLER" },
  });
  buyer = await prisma.user.create({
    data: { name: "Demo Buyer", email: "demobuyer@tori.local", password: HASH, role: "BUYER" },
  });
  category = await prisma.category.create({
    data: { name: "Electronics", slug: "electronics" },
  });
});

afterAll(async () => {
  try {
    if (prisma) await prisma.$disconnect();
  } catch {}
  if (existsSync(dbFile)) {
    try {
      unlinkSync(dbFile);
    } catch {}
  }
});

describe("URGENT DEMO FIX: Seller Create Auction", () => {
  it("successfully creates an auction with image and images without ReferenceError", async () => {
    as(seller);

    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const startTime = "10:00";
    const future = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
    const endDate = future.toISOString().slice(0, 10);
    const endTime = "18:00";

    let redirectUrl = null;
    try {
      await createAuctionAction({
        title: "Test Brand New Item 2026",
        description: "This is a detailed description of the test auction item with over twenty chars.",
        categoryId: category.id,
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
        startingPrice: 50000,
        minimumIncrement: 1000,
        startDate,
        startTime,
        endDate,
        endTime,
      });
    } catch (err) {
      if (err.isRedirect) {
        redirectUrl = err.url;
      } else {
        throw err;
      }
    }

    expect(redirectUrl).toBe("/dashboard/my-auctions?created=1");

    const created = await prisma.auction.findFirst({
      where: { title: "Test Brand New Item 2026" },
    });
    expect(created).not.toBeNull();
    expect(created.startingPrice).toBe(50000);
    expect(created.currentPrice).toBe(50000);
    expect(created.sellerId).toBe(seller.id);
  });
});

describe("URGENT DEMO FIX: Demo Lot Live Bidding", () => {
  it("ensures demo lots have active timestamps and accept bids via existing server rules", async () => {
    // 1. Create a demo lot with an EXPIRED timestamp (simulating production state)
    const pastStart = new Date(Date.now() - 10 * 24 * 3600 * 1000);
    const pastEnd = new Date(Date.now() - 2 * 24 * 3600 * 1000);

    const demoAuction = await prisma.auction.create({
      data: {
        title: "ApexBook Ultra 16 OLED",
        description: "Flagship laptop with gorgeous 4K OLED display and cutting edge performance.",
        startingPrice: 115000,
        currentPrice: 115000,
        minimumIncrement: 2000,
        startTime: pastStart,
        endTime: pastEnd,
        status: "ENDED",
        sellerId: seller.id,
        categoryId: category.id,
      },
    });

    // 2. ensureDemoLotsActive slides expired demo lot forward with real future timestamps
    await ensureDemoLotsActive(true);

    const refreshed = await prisma.auction.findUnique({ where: { id: demoAuction.id } });
    expect(refreshed.status).toBe("ACTIVE");
    expect(new Date(refreshed.endTime).getTime()).toBeGreaterThan(Date.now());

    // 3. getAuctions returns it as active with isDemo flag
    const auctions = await getAuctions();
    const foundDemo = auctions.find((a) => a.id === demoAuction.id);
    expect(foundDemo).toBeDefined();
    expect(foundDemo.status).toBe("active");
    expect(foundDemo.isDemo).toBe(true);

    // 4. A signed-in buyer submits a valid bid
    as(buyer);
    const bidResult = await placeBidAction(demoAuction.id, 117000);
    expect(bidResult.ok).toBe(true);

    // 5. Verify bid persisted to database
    const bids = await prisma.bid.findMany({ where: { auctionId: demoAuction.id } });
    expect(bids.length).toBe(1);
    expect(bids[0].amount).toBe(117000);
    expect(bids[0].bidderId).toBe(buyer.id);

    // 6. Verify auction currentPrice updated
    const updatedAuction = await prisma.auction.findUnique({ where: { id: demoAuction.id } });
    expect(updatedAuction.currentPrice).toBe(117000);
  });
});
