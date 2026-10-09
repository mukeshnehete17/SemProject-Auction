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

const dbFile = join(tmpdir(), `tori-test-${process.pid}.db`);
process.env.DATABASE_URL = `file:${dbFile}`;

let prisma;
let placeBidAction;
let cancelAuctionAction;
let adminChangeRoleAction;
let adminCancelAuctionAction;
let updateProfileAction;
let getAuctionWinner;
let completeAuctionIfNeeded;
let addToWatchlist;
let removeFromWatchlist;
let markNotificationAsRead;
let registerAction;

let seller;
let seller2;
let buyerA;
let buyerB;
let admin;
let category;
let liveAuction;
let endedNoBidAuction;

const H = "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789012";

beforeAll(async () => {
  // Build the isolated test database by applying the COMMITTED migration
  // SQL files in order with plain better-sqlite3. This deliberately avoids
  // `prisma migrate/db push` (destructive tooling) — the target is a fresh
  // temp file, never the development or production database, and the
  // schema is byte-identical to what migrations produce.
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const setup = new Database(dbFile);
  try {
    for (const m of ["20260910103445_init", "20260910114613_phase5_watchlist_notifications"]) {
      setup.exec(
        readFileSync(join(repoRoot, "prisma", "migrations", m, "migration.sql"), "utf8")
      );
    }
  } finally {
    setup.close();
  }

  vi.resetModules();
  ({ prisma } = await import("@/lib/prisma.js"));
  ({ placeBidAction, cancelAuctionAction } = await import("@/lib/auction-actions.js"));
  ({ adminChangeRoleAction, adminCancelAuctionAction } = await import(
    "@/lib/admin-actions.js"
  ));
  ({ updateProfileAction } = await import("@/lib/profile-actions.js"));
  ({ getAuctionWinner, completeAuctionIfNeeded } = await import("@/lib/auctions.js"));
  ({ addToWatchlist, removeFromWatchlist } = await import("@/lib/watchlist.js"));
  ({ markNotificationAsRead } = await import("@/lib/notifications.js"));
  ({ registerAction } = await import("@/app/register/actions.js"));

  seller = await prisma.user.create({
    data: { name: "Test Seller", email: "seller@test.local", password: H, role: "SELLER" },
  });
  seller2 = await prisma.user.create({
    data: { name: "Seller Two", email: "seller2@test.local", password: H, role: "SELLER" },
  });
  buyerA = await prisma.user.create({
    data: { name: "Buyer A", email: "buyera@test.local", password: H, role: "BUYER" },
  });
  buyerB = await prisma.user.create({
    data: { name: "Buyer B", email: "buyerb@test.local", password: H, role: "BUYER" },
  });
  admin = await prisma.user.create({
    data: { name: "Admin", email: "admin@test.local", password: H, role: "ADMIN" },
  });
  category = await prisma.category.create({ data: { name: "TestCat", slug: "testcat" } });

  const now = Date.now();
  liveAuction = await prisma.auction.create({
    data: {
      title: "Live Lot",
      description: "A live test lot with sufficient description length.",
      startingPrice: 5000,
      currentPrice: 5000,
      minimumIncrement: 500,
      startTime: new Date(now - 3600_000),
      endTime: new Date(now + 3600_000),
      status: "ACTIVE",
      sellerId: seller.id,
      categoryId: category.id,
    },
  });
  endedNoBidAuction = await prisma.auction.create({
    data: {
      title: "Ended Empty Lot",
      description: "An ended test lot with sufficient description length.",
      startingPrice: 1000,
      currentPrice: 1000,
      minimumIncrement: 100,
      startTime: new Date(now - 7200_000),
      endTime: new Date(now - 3600_000),
      status: "ENDED",
      sellerId: seller.id,
      categoryId: category.id,
    },
  });
}, 120000);

afterAll(async () => {
  await prisma?.$disconnect();
  for (const f of [dbFile, `${dbFile}-journal`]) {
    try {
      if (existsSync(f)) unlinkSync(f);
    } catch {}
  }
});

describe("registration", () => {
  it("rejects duplicate email without exposing internals", async () => {
    as(null);
    const res = await registerAction("Someone", "buyerA@test.local", "password123", "buyer");
    expect(res.error).toBe("An account with this email already exists.");
  });
  it("rejects privileged role escalation via accountType", async () => {
    as(null);
    const res = await registerAction("Sneaky", "sneaky@test.local", "password123", "admin");
    expect(res.error).toBe("Please select an account type.");
    expect(await prisma.user.findUnique({ where: { email: "sneaky@test.local" } })).toBeNull();
  });
});

describe("bidding engine", () => {
  it("requires authentication", async () => {
    as(null);
    const res = await placeBidAction(liveAuction.id, 5500);
    expect(res.code).toBe("UNAUTHENTICATED");
  });
  it("rejects seller self-bidding", async () => {
    as({ id: seller.id, role: "SELLER" });
    const res = await placeBidAction(liveAuction.id, 5500);
    expect(res.error).toBe("You cannot bid on your own auction.");
  });
  it("enforces the minimum increment", async () => {
    as({ id: buyerA.id, role: "BUYER" });
    const res = await placeBidAction(liveAuction.id, 5499);
    expect(res.error).toMatch(/must be at least/);
  });
  it("rejects bids on ended auctions", async () => {
    as({ id: buyerA.id, role: "BUYER" });
    const res = await placeBidAction(endedNoBidAuction.id, 1100);
    expect(res.error).toBe("This auction has already ended.");
  });
  it("accepts a valid bid and updates the authoritative price", async () => {
    as({ id: buyerA.id, role: "BUYER" });
    const res = await placeBidAction(liveAuction.id, 5500);
    expect(res.ok).toBe(true);
    const row = await prisma.auction.findUnique({ where: { id: liveAuction.id } });
    expect(row.currentPrice).toBe(5500);
  });
  it("notifies the outbid bidder and converges price under concurrency", async () => {
    const now = Date.now();
    const race = await prisma.auction.create({
      data: {
        title: "Race Lot",
        description: "A concurrency test lot with sufficient description.",
        startingPrice: 5000,
        currentPrice: 5000,
        minimumIncrement: 500,
        startTime: new Date(now - 3600_000),
        endTime: new Date(now + 3600_000),
        status: "ACTIVE",
        sellerId: seller.id,
        categoryId: category.id,
      },
    });
    const [r1, r2] = await Promise.all([
      (async () => {
        as({ id: buyerA.id, role: "BUYER" });
        return placeBidAction(race.id, 6000);
      })(),
      (async () => {
        as({ id: buyerB.id, role: "BUYER" });
        return placeBidAction(race.id, 6500);
      })(),
    ]);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    const row = await prisma.auction.findUnique({ where: { id: race.id } });
    const max = await prisma.bid.aggregate({
      where: { auctionId: race.id },
      _max: { amount: true },
    });
    // Convergence invariant: price always equals the highest recorded bid.
    expect(row.currentPrice).toBe(max._max.amount);
    expect(row.currentPrice).toBe(6500);
    const outbids = await prisma.notification.findMany({
      where: { type: "OUTBID", referenceId: race.id },
    });
    expect(outbids.length).toBeGreaterThanOrEqual(1);
  });
});

describe("auction completion", () => {
  it("returns null winner for auctions without bids", async () => {
    expect(await getAuctionWinner(endedNoBidAuction.id)).toBeNull();
  });
  it("names the top bidder and never duplicates notifications on retry", async () => {
    const winner = await getAuctionWinner(liveAuction.id);
    expect(winner.bidderId).toBe(buyerA.id);
    expect(winner.amount).toBe(5500);
    // End the auction, then complete twice.
    await prisma.auction.update({
      where: { id: liveAuction.id },
      data: { endTime: new Date(Date.now() - 1000) },
    });
    await completeAuctionIfNeeded(liveAuction.id);
    await completeAuctionIfNeeded(liveAuction.id);
    const won = await prisma.notification.count({
      where: { userId: buyerA.id, type: "AUCTION_WON", referenceId: liveAuction.id },
    });
    const sellerNotifs = await prisma.notification.count({
      where: { userId: seller.id, type: "AUCTION_ENDED", referenceId: liveAuction.id },
    });
    expect(won).toBe(1);
    expect(sellerNotifs).toBe(1);
  });
});

describe("watchlist ownership", () => {
  it("is idempotent and scoped to the owning user", async () => {
    expect((await addToWatchlist(buyerA.id, liveAuction.id)).ok).toBe(true);
    expect((await addToWatchlist(buyerA.id, liveAuction.id)).ok).toBe(true);
    expect(
      await prisma.watchlist.count({
        where: { userId: buyerA.id, auctionId: liveAuction.id },
      })
    ).toBe(1);
    // Buyer B cannot remove buyer A's entry.
    await removeFromWatchlist(buyerB.id, liveAuction.id);
    expect(
      await prisma.watchlist.count({
        where: { userId: buyerA.id, auctionId: liveAuction.id },
      })
    ).toBe(1);
    await removeFromWatchlist(buyerA.id, liveAuction.id);
    expect(
      await prisma.watchlist.count({
        where: { userId: buyerA.id, auctionId: liveAuction.id },
      })
    ).toBe(0);
  });
});

describe("notification privacy", () => {
  it("blocks cross-user reads and allows owner reads", async () => {
    const n = await prisma.notification.create({
      data: { userId: buyerA.id, message: "private", type: "TEST", referenceId: 1 },
    });
    expect(await markNotificationAsRead(buyerB.id, n.id)).toBe(false);
    expect(await markNotificationAsRead(buyerA.id, n.id)).toBe(true);
  });
});

describe("admin guards", () => {
  it("rejects non-admin role changes and self-changes", async () => {
    as({ id: buyerA.id, role: "BUYER" });
    expect((await adminChangeRoleAction(buyerB.id, "SELLER")).error).toMatch(/authorized/);
    as({ id: admin.id, role: "ADMIN" });
    expect((await adminChangeRoleAction(admin.id, "BUYER")).error).toMatch(/own role/);
    expect((await adminChangeRoleAction(admin.id, "SELLER")).error).toBeTruthy();
  });
  it("lets admins change BUYER/SELLER roles but never ADMIN", async () => {
    as({ id: admin.id, role: "ADMIN" });
    expect((await adminChangeRoleAction(buyerB.id, "SELLER")).ok).toBe(true);
    expect((await prisma.user.findUnique({ where: { id: buyerB.id } })).role).toBe("SELLER");
    expect((await adminChangeRoleAction(buyerB.id, "BUYER")).ok).toBe(true);
  });
  it("enforces seller ownership on cancellation", async () => {
    as({ id: seller2.id, role: "SELLER" });
    expect((await cancelAuctionAction(liveAuction.id)).error).toMatch(/owner/);
  });
  it("blocks admin cancellation of lots with bids", async () => {
    as({ id: admin.id, role: "ADMIN" });
    // liveAuction has bids and is now ended; use a fresh no-bid lot for the ok-path.
    const now = Date.now();
    const fresh = await prisma.auction.create({
      data: {
        title: "Cancellable Lot",
        description: "A cancellable test lot with sufficient description.",
        startingPrice: 2000,
        currentPrice: 2000,
        minimumIncrement: 200,
        startTime: new Date(now - 3600_000),
        endTime: new Date(now + 3600_000),
        status: "ACTIVE",
        sellerId: seller.id,
        categoryId: category.id,
      },
    });
    expect((await adminCancelAuctionAction(fresh.id)).ok).toBe(true);
    expect((await adminCancelAuctionAction(liveAuction.id)).error).toBeTruthy();
  });
});

describe("profile", () => {
  it("persists name/email, rejects duplicates, ignores role injection", async () => {
    as({ id: buyerA.id, role: "BUYER", email: "buyera@test.local" });
    expect(
      await updateProfileAction({ name: "Buyer A", email: "buyerb@test.local" })
    ).toEqual({ error: "An account with this email already exists." });
    const res = await updateProfileAction({
      name: "Buyer A Updated",
      email: "buyera@test.local",
      role: "ADMIN",
    });
    expect(res.ok).toBe(true);
    const row = await prisma.user.findUnique({ where: { id: buyerA.id } });
    expect(row.name).toBe("Buyer A Updated");
    expect(row.role).toBe("BUYER");
  });
});
