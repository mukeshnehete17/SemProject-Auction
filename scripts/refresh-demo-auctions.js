const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const path = require("path");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv/config");

const { getDemoAuctionDefinitions } = require("../prisma/seed.js");

const rawUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
let pgPool = null;

function createPrisma() {
  if (/^(postgres(ql)?):\/\//i.test(rawUrl)) {
    pgPool = new Pool({ connectionString: rawUrl });
    return new PrismaClient({ adapter: new PrismaPg(pgPool) });
  }
  const cleanPath = rawUrl.replace(/^file:/, "").replace(".\\", "./");
  const absolutePath = path.isAbsolute(cleanPath)
    ? cleanPath
    : path.resolve(process.cwd(), cleanPath);
  const adapter = new PrismaBetterSqlite3({ url: absolutePath });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

async function refreshDemoAuctions() {
  console.log("Starting non-destructive demo auctions refresh...");

  const users = await prisma.user.findMany();
  const userByEmail = {};
  for (const u of users) userByEmail[u.email] = u;

  const categories = await prisma.category.findMany();
  const categoryBySlug = {};
  for (const c of categories) categoryBySlug[c.slug] = c;

  // Verify minimal prerequisites
  const requiredUsers = [
    "amit.seller@bidzone.com",
    "sneha.seller@bidzone.com",
    "arjun.seller@bidzone.com",
    "seller@bidzone.local",
    "krishna.buyer@bidzone.com",
    "priya.buyer@bidzone.com",
    "rahul.buyer@bidzone.com",
    "buyer@bidzone.local",
  ];

  const missingUsers = requiredUsers.filter((email) => !userByEmail[email]);
  if (missingUsers.length > 0) {
    console.error(`Cannot refresh: missing required demo users (${missingUsers.join(", ")}). Run db:seed first.`);
    return;
  }

  const definitions = getDemoAuctionDefinitions(userByEmail, categoryBySlug);
  let updatedCount = 0;
  let createdCount = 0;

  for (const def of definitions) {
    const { bids, ...auctionData } = def;

    const existing = await prisma.auction.findFirst({
      where: { title: auctionData.title },
    });

    if (existing) {
      await prisma.auction.update({
        where: { id: existing.id },
        data: {
          description: auctionData.description,
          image: auctionData.image,
          startingPrice: auctionData.startingPrice,
          currentPrice: auctionData.currentPrice,
          minimumIncrement: auctionData.minimumIncrement,
          startTime: auctionData.startTime,
          endTime: auctionData.endTime,
          status: auctionData.status,
          categoryId: auctionData.categoryId,
        },
      });
      updatedCount++;

      if (bids && bids.length > 0) {
        const bidCount = await prisma.bid.count({ where: { auctionId: existing.id } });
        if (bidCount === 0) {
          await prisma.bid.createMany({
            data: bids.map((b) => ({ ...b, auctionId: existing.id })),
          });
        }
      }
    } else {
      await prisma.auction.create({
        data: {
          ...auctionData,
          bids: bids && bids.length > 0 ? { create: bids } : undefined,
        },
      });
      createdCount++;
    }
  }

  const total = await prisma.auction.count();
  const activeCount = await prisma.auction.count({ where: { status: "ACTIVE" } });
  const upcomingCount = await prisma.auction.count({ where: { status: "UPCOMING" } });
  const endedCount = await prisma.auction.count({ where: { status: "ENDED" } });
  const cancelledCount = await prisma.auction.count({ where: { status: "CANCELLED" } });

  console.log("Demo Auction Refresh Complete:");
  console.log(`  Updated existing lots: ${updatedCount}`);
  console.log(`  Created missing lots:  ${createdCount}`);
  console.log(`  Total lots in DB:      ${total}`);
  console.log(`    - Live/Active:       ${activeCount}`);
  console.log(`    - Upcoming:          ${upcomingCount}`);
  console.log(`    - Ended (Preserved): ${endedCount}`);
  console.log(`    - Cancelled:         ${cancelledCount}`);
}

refreshDemoAuctions()
  .catch((err) => {
    console.error("Refresh failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (pgPool) await pgPool.end();
  });
