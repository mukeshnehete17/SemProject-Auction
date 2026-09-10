import { prisma } from "@/lib/prisma";
import { deriveStatus } from "@/lib/auctions";

function toWatchlistShape(entry) {
  const auction = entry.auction;
  return {
    id: entry.id,
    auctionId: auction.id,
    title: auction.title,
    image: auction.image,
    currentPrice: auction.currentPrice,
    numberOfBids: auction._count?.bids ?? 0,
    category: auction.category?.name || "Other",
    status: deriveStatus(auction.status, auction.startTime, auction.endTime),
    startTime: auction.startTime.toISOString(),
    endTime: auction.endTime.toISOString(),
  };
}

export async function getUserWatchlist(userId) {
  try {
    const rows = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        auction: {
          include: {
            category: { select: { name: true } },
            _count: { select: { bids: true } },
            seller: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toWatchlistShape);
  } catch {
    return [];
  }
}

export async function isAuctionInWatchlist(userId, auctionId) {
  const numericId = Number.parseInt(auctionId, 10);
  if (!userId || Number.isNaN(numericId)) return false;
  try {
    const entry = await prisma.watchlist.findUnique({
      where: { userId_auctionId: { userId, auctionId: numericId } },
      select: { id: true },
    });
    return !!entry;
  } catch {
    return false;
  }
}

export async function addToWatchlist(userId, auctionId) {
  const numericId = Number.parseInt(auctionId, 10);
  if (Number.isNaN(numericId)) return { error: "Auction not found." };
  const auction = await prisma.auction.findUnique({
    where: { id: numericId },
    select: { id: true, status: true },
  });
  if (!auction) return { error: "Auction not found." };
  if (auction.status === "CANCELLED") {
    return { error: "This auction has been cancelled." };
  }
  await prisma.watchlist.upsert({
    where: { userId_auctionId: { userId, auctionId: numericId } },
    update: {},
    create: { userId, auctionId: numericId },
  });
  return { ok: true };
}

export async function removeFromWatchlist(userId, auctionId) {
  const numericId = Number.parseInt(auctionId, 10);
  if (Number.isNaN(numericId)) return { error: "Auction not found." };
  await prisma.watchlist.deleteMany({
    where: { userId, auctionId: numericId },
  });
  return { ok: true };
}

export async function getWatchlistCount(userId) {
  try {
    return await prisma.watchlist.count({ where: { userId } });
  } catch {
    return 0;
  }
}