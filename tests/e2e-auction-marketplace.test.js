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

const dbFile = join(tmpdir(), `tori-e2e-test-${process.pid}.db`);
process.env.DATABASE_URL = `file:${dbFile}`;

let prisma;
let placeBidAction;
let getAuctions;
let getAuctionWinner;
let addToWatchlist;
let removeFromWatchlist;

let seller;
let buyerA;
let buyerB;
let admin;
let categoryElectronics;
let categoryWatches;
let activeAuction;
let expiredAuction;

const HASH = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012";

beforeAll(async () => {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const setup = new Database(dbFile);
  try {
    for (const m of [
      "20260910103445_init",
      "20260910114613_phase5_watchlist_notifications",
      "20261010_password_reset_token",
    ]) {
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
  ({ getAuctions, getAuctionWinner } = await import("@/lib/auctions.js"));
  ({ addToWatchlist, removeFromWatchlist } = await import("@/lib/watchlist.js"));

  seller = await prisma.user.create({
    data: { name: "Vault Master", email: "seller@tori.test", password: HASH, role: "SELLER" },
  });
  buyerA = await prisma.user.create({
    data: { name: "Collector Alpha", email: "alpha@tori.test", password: HASH, role: "BUYER" },
  });
  buyerB = await prisma.user.create({
    data: { name: "Collector Beta", email: "beta@tori.test", password: HASH, role: "BUYER" },
  });
  admin = await prisma.user.create({
    data: { name: "Platform Admin", email: "admin@tori.test", password: HASH, role: "ADMIN" },
  });

  categoryElectronics = await prisma.category.create({
    data: { name: "Electronics", slug: "electronics" },
  });
  categoryWatches = await prisma.category.create({
    data: { name: "Watches", slug: "watches" },
  });

  const now = Date.now();
  activeAuction = await prisma.auction.create({
    data: {
      title: "ApexBook Ultra 16 OLED Demo",
      description: "Precision-milled aerospace magnesium chassis with 4K OLED display.",
      image: "/images/products/ultrabook_laptop.jpg",
      startingPrice: 100000,
      currentPrice: 100000,
      minimumIncrement: 2000,
      startTime: new Date(now - 3600_000),
      endTime: new Date(now + 86400_000 * 3),
      status: "ACTIVE",
      sellerId: seller.id,
      categoryId: categoryElectronics.id,
    },
  });

  expiredAuction = await prisma.auction.create({
    data: {
      title: "Archival Chronometer",
      description: "Rare vintage chronometer with museum provenance.",
      image: "/images/products/luxury_diver_watch.jpg",
      startingPrice: 200000,
      currentPrice: 200000,
      minimumIncrement: 5000,
      startTime: new Date(now - 86400_000 * 10),
      endTime: new Date(now - 86400_000 * 2),
      status: "ENDED",
      sellerId: seller.id,
      categoryId: categoryWatches.id,
    },
  });
}, 60000);

afterAll(async () => {
  await prisma?.$disconnect();
  for (const f of [dbFile, `${dbFile}-journal`]) {
    try {
      if (existsSync(f)) unlinkSync(f);
    } catch {}
  }
});

describe("Two-User Bidding End-to-End Workflow", () => {
  it("verifies initial auction state and starting price", async () => {
    const lot = await prisma.auction.findUnique({
      where: { id: activeAuction.id },
      include: { bids: true },
    });
    expect(lot.currentPrice).toBe(100000);
    expect(lot.minimumIncrement).toBe(2000);
    expect(lot.bids.length).toBe(0);
  });

  it("submits valid bid from User A and updates authoritative price", async () => {
    as({ id: buyerA.id, role: "BUYER" });
    const res = await placeBidAction(activeAuction.id, 102000);
    expect(res.ok).toBe(true);
    expect(res.amount).toBe(102000);

    const lot = await prisma.auction.findUnique({
      where: { id: activeAuction.id },
      include: { bids: { orderBy: { createdAt: "desc" } } },
    });
    expect(lot.currentPrice).toBe(102000);
    expect(lot.bids.length).toBe(1);
    expect(lot.bids[0].bidderId).toBe(buyerA.id);
  });

  it("submits lower-than-required bid from User B and verifies rejection", async () => {
    as({ id: buyerB.id, role: "BUYER" });
    // Current price is 102,000 and increment is 2,000, minimum is 104,000. Submit 103,000:
    const res = await placeBidAction(activeAuction.id, 103000);
    expect(res.error).toMatch(/must be at least/);

    // Verify rejected bid did NOT alter the currentPrice in DB
    const lot = await prisma.auction.findUnique({ where: { id: activeAuction.id } });
    expect(lot.currentPrice).toBe(102000);
  });

  it("submits valid higher bid from User B and verifies outbid notification to User A", async () => {
    as({ id: buyerB.id, role: "BUYER" });
    const res = await placeBidAction(activeAuction.id, 105000);
    expect(res.ok).toBe(true);

    const lot = await prisma.auction.findUnique({
      where: { id: activeAuction.id },
      include: { bids: { orderBy: { amount: "desc" } } },
    });
    expect(lot.currentPrice).toBe(105000);
    expect(lot.bids.length).toBe(2);
    expect(lot.bids[0].bidderId).toBe(buyerB.id);

    // Verify outbid notification generated for User A
    const outbidNotice = await prisma.notification.findFirst({
      where: { userId: buyerA.id, type: "OUTBID", referenceId: activeAuction.id },
    });
    expect(outbidNotice).not.toBeNull();
    expect(outbidNotice.message).toContain(activeAuction.title);
  });

  it("verifies bid persistence surviving re-fetch", async () => {
    const freshFetch = await prisma.auction.findUnique({
      where: { id: activeAuction.id },
      include: { bids: { orderBy: { amount: "desc" } } },
    });
    expect(freshFetch.currentPrice).toBe(105000);
    expect(freshFetch.bids[0].amount).toBe(105000);
    expect(freshFetch.bids[0].bidderId).toBe(buyerB.id);
  });

  it("rejects bids on expired auctions", async () => {
    as({ id: buyerA.id, role: "BUYER" });
    const res = await placeBidAction(expiredAuction.id, 210000);
    expect(res.error).toBe("This auction has already ended.");
  });

  it("rejects unauthenticated bids", async () => {
    as(null);
    const res = await placeBidAction(activeAuction.id, 110000);
    expect(res.code).toBe("UNAUTHENTICATED");
  });

  it("rejects seller self-bidding", async () => {
    as({ id: seller.id, role: "SELLER" });
    const res = await placeBidAction(activeAuction.id, 110000);
    expect(res.error).toBe("You cannot bid on your own auction.");
  });

  it("rejects admin bidding", async () => {
    as({ id: admin.id, role: "ADMIN" });
    const res = await placeBidAction(activeAuction.id, 110000);
    expect(res.error).toBe("Admins cannot place bids.");
  });
});

describe("Concurrency and Price Convergence", () => {
  it("handles concurrent bids safely without race condition corrupting price", async () => {
    const now = Date.now();
    const concurrentLot = await prisma.auction.create({
      data: {
        title: "Concurrent Flagship GPU",
        description: "Heavy load stress test lot for high-velocity bidding.",
        startingPrice: 50000,
        currentPrice: 50000,
        minimumIncrement: 1000,
        startTime: new Date(now - 3600_000),
        endTime: new Date(now + 3600_000 * 5),
        status: "ACTIVE",
        sellerId: seller.id,
        categoryId: categoryElectronics.id,
      },
    });

    const [b1, b2] = await Promise.all([
      (async () => {
        as({ id: buyerA.id, role: "BUYER" });
        return placeBidAction(concurrentLot.id, 55000);
      })(),
      (async () => {
        as({ id: buyerB.id, role: "BUYER" });
        return placeBidAction(concurrentLot.id, 58000);
      })(),
    ]);

    expect(b1.ok).toBe(true);
    expect(b2.ok).toBe(true);

    const updated = await prisma.auction.findUnique({
      where: { id: concurrentLot.id },
      include: { bids: { orderBy: { amount: "desc" } } },
    });
    expect(updated.currentPrice).toBe(58000);
    expect(updated.bids.length).toBe(2);
  });
});

describe("Local Product Asset Verification", () => {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

  it("verifies that all 20 required local demo product images exist on disk", () => {
    const requiredImages = [
      "ultrabook_laptop.jpg",
      "flagship_smartphone.jpg",
      "luxury_diver_watch.jpg",
      "gaming_console.jpg",
      "mirrorless_camera.jpg",
      "collectible_sneakers.jpg",
      "graphics_card.jpg",
      "scifi_spaceship.jpg",
      "wireless_headphones.jpg",
      "mechanical_keyboard.jpg",
      "designer_lounge_chair.jpg",
      "abstract_sculpture.jpg",
      "premium_smartwatch.jpg",
      "gaming_mouse.jpg",
      "studio_microphone.jpg",
      "retro_handheld.jpg",
      "art_print.jpg",
      "premium_backpack.jpg",
      "modern_desk_lamp.jpg",
      "model_car.jpg",
    ];

    for (const img of requiredImages) {
      const p = join(repoRoot, "public", "images", "products", img);
      expect(existsSync(p), `Missing product image: ${img}`).toBe(true);
    }
  });

  it("verifies that all 8 category banner visuals exist on disk", () => {
    const requiredCategories = [
      "electronics.jpg",
      "watches.jpg",
      "sneakers.jpg",
      "gaming.jpg",
      "cameras.jpg",
      "collectibles.jpg",
      "computers.jpg",
      "art-design.jpg",
    ];

    for (const cat of requiredCategories) {
      const p = join(repoRoot, "public", "images", "categories", cat);
      expect(existsSync(p), `Missing category image: ${cat}`).toBe(true);
    }
  });
});
