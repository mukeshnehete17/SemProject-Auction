import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { formatPrice } from "@/lib/utils";

const ENDING_SOON_HOURS = 24;

export function deriveStatus(status, startTime, endTime) {
  if (status === "CANCELLED") return "cancelled";

  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return status ? status.toLowerCase() : "active";
  }
  if (now >= end) return "ended";
  if (now < start) return "upcoming";

  const hoursLeft = (end - now) / (60 * 60 * 1000);
  return hoursLeft <= ENDING_SOON_HOURS ? "ending_soon" : "active";
}

export function normalizeStatus(status, startTime, endTime) {
  return deriveStatus(status, startTime, endTime);
}

export function toAuctionShape(auction) {
  return {
    id: auction.id,
    title: auction.title,
    description: auction.description,
    image: auction.image,
    category: auction.category?.name || "Other",
    startingPrice: auction.startingPrice,
    currentBid: auction.currentPrice,
    bidIncrement: auction.minimumIncrement,
    numberOfBids: auction._count?.bids ?? auction.bids?.length ?? 0,
    seller: {
      name: auction.seller?.name || "Unknown Seller",
      rating: 4.5,
    },
    sellerId: auction.sellerId,
    startTime: auction.startTime.toISOString(),
    endTime: auction.endTime.toISOString(),
    status: deriveStatus(auction.status, auction.startTime, auction.endTime),
    bids: (auction.bids || []).map((bid) => ({
      bidder: bid.bidder?.name || "Bidder",
      amount: bid.amount,
      time: bid.createdAt.toISOString(),
    })),
  };
}

const VALID_SORTS = new Set([
  "ending_soon",
  "newest",
  "price_low",
  "price_high",
  "most_bids",
]);

function toNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function buildStatusWhere(status) {
  const now = new Date();
  const soon = new Date(now.getTime() + ENDING_SOON_HOURS * 60 * 60 * 1000);
  switch (status) {
    case "active":
      return {
        status: { not: "CANCELLED" },
        startTime: { lte: now },
        endTime: { gt: soon },
      };
    case "ending_soon":
      return {
        status: { not: "CANCELLED" },
        startTime: { lte: now },
        endTime: { gt: now, lte: soon },
      };
    case "upcoming":
      return { status: { not: "CANCELLED" }, startTime: { gt: now } };
    case "ended":
      return { status: { not: "CANCELLED" }, endTime: { lte: now } };
    case "cancelled":
      return { status: "CANCELLED" };
    default:
      return null;
  }
}

export function getAuctionSortOrder(sort) {
  switch (sort) {
    case "price_low":
      return [{ currentPrice: "asc" }];
    case "price_high":
      return [{ currentPrice: "desc" }];
    case "most_bids":
      return [{ bids: { _count: "desc" } }];
    case "newest":
      return [{ createdAt: "desc" }];
    case "ending_soon":
    default:
      return [{ endTime: "asc" }];
  }
}

export async function getAuctions(filters = {}) {
  const { search, category, status, minPrice, maxPrice, sort } = filters || {};
  const where = {};

  const query = typeof search === "string" ? search.trim() : "";
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
    ];
  }

  if (category && category !== "all") {
    const cat = await prisma.category.findUnique({
      where: { slug: category },
    });
    if (!cat) return [];
    where.categoryId = cat.id;
  }

  const min = toNumber(minPrice);
  const max = toNumber(maxPrice);
  if (min !== null || max !== null) {
    where.currentPrice = {};
    if (min !== null) where.currentPrice.gte = min;
    if (max !== null) where.currentPrice.lte = max;
  }

  if (status && status !== "all") {
    const statusWhere = buildStatusWhere(status);
    if (statusWhere) Object.assign(where, statusWhere);
  }

  const rows = await prisma.auction.findMany({
    where,
    include: {
      seller: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { bids: true } },
    },
    orderBy: VALID_SORTS.has(sort) ? getAuctionSortOrder(sort) : [{ endTime: "asc" }],
    // Safe default limit: the catalogue UI has no pagination, so cap the
    // result set instead of issuing an unbounded query.
    take: 100,
  });
  return rows.map(toAuctionShape);
}

export async function getAuctionWinner(auctionId) {
  const numericId = Number.parseInt(auctionId, 10);
  if (Number.isNaN(numericId)) return null;

  try {
    const topBid = await prisma.bid.findFirst({
      where: { auctionId: numericId },
      orderBy: { amount: "desc" },
      include: { bidder: { select: { id: true, name: true } } },
    });
    if (!topBid) return null;
    return {
      bidderId: topBid.bidderId,
      bidderName: topBid.bidder.name,
      amount: topBid.amount,
      createdAt: topBid.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function completeAuctionIfNeeded(auctionId) {
  const numericId = Number.parseInt(auctionId, 10);
  if (Number.isNaN(numericId)) return;

  let row;
  try {
    row = await prisma.auction.findUnique({
      where: { id: numericId },
      include: {
        seller: { select: { id: true, name: true } },
        bids: {
          include: { bidder: { select: { id: true, name: true } } },
          orderBy: { amount: "desc" },
          take: 1,
        },
      },
    });
  } catch {
    return;
  }
  if (!row || !row.seller) return;
  if (row.status === "CANCELLED") return;
  if (new Date(row.endTime) > new Date()) return;

  const winner = row.bids[0] || null;

  if (winner && winner.bidderId !== row.sellerId) {
    await createNotification({
      userId: winner.bidderId,
      type: "AUCTION_WON",
      referenceId: row.id,
      message: `Congratulations! You won the auction for ${row.title} with a bid of ${formatPrice(winner.amount)}.`,
      dedupe: true,
    });
  }

  await createNotification({
    userId: row.sellerId,
    type: "AUCTION_ENDED",
    referenceId: row.id,
    message: winner
      ? `Your auction "${row.title}" has ended — ${winner.bidder.name} won with a bid of ${formatPrice(winner.amount)}.`
      : `Your auction "${row.title}" has ended with no bids.`,
    dedupe: true,
  });
}

export async function getAuctionById(id) {
  const numericId = Number.parseInt(id, 10);
  if (Number.isNaN(numericId)) return null;

  await completeAuctionIfNeeded(numericId);

  try {
    const row = await prisma.auction.findUnique({
      where: { id: numericId },
      include: {
        seller: { select: { name: true, id: true } },
        category: { select: { name: true } },
        bids: {
          include: { bidder: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { bids: true } },
      },
    });
    return row ? toAuctionShape(row) : null;
  } catch {
    return null;
  }
}

export async function getAuctionsBySeller(sellerId) {
  try {
    const rows = await prisma.auction.findMany({
      where: { sellerId },
      include: {
        category: { select: { name: true } },
        bids: {
          include: { bidder: { select: { id: true, name: true } } },
          orderBy: { amount: "desc" },
          take: 1,
        },
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = [];
    for (const row of rows) {
      await completeAuctionIfNeeded(row.id);
      const status = deriveStatus(row.status, row.startTime, row.endTime);
      const topBid = row.bids[0] || null;
      result.push({
        id: row.id,
        title: row.title,
        image: row.image,
        category: row.category?.name || "Other",
        startingPrice: row.startingPrice,
        currentPrice: row.currentPrice,
        minimumIncrement: row.minimumIncrement,
        numberOfBids: row._count.bids,
        status,
        startTime: row.startTime.toISOString(),
        endTime: row.endTime.toISOString(),
        sellerId: row.sellerId,
        winner:
          status === "ended" && topBid
            ? {
                bidderId: topBid.bidderId,
                bidderName: topBid.bidder.name,
                amount: topBid.amount,
              }
            : null,
      });
    }
    return result;
  } catch {
    return [];
  }
}

export async function getWonAuctionsByUser(userId) {
  try {
    const rows = await prisma.auction.findMany({
      where: {
        status: { not: "CANCELLED" },
        endTime: { lte: new Date() },
        bids: { some: { bidderId: userId } },
      },
      include: {
        seller: { select: { name: true } },
        category: { select: { name: true } },
        bids: {
          include: { bidder: { select: { id: true, name: true } } },
          orderBy: { amount: "desc" },
        },
        _count: { select: { bids: true } },
      },
      orderBy: { endTime: "desc" },
    });

    const result = [];
    for (const row of rows) {
      await completeAuctionIfNeeded(row.id);
      const topBid = row.bids[0] || null;
      if (!topBid || topBid.bidderId !== userId) continue;
      result.push({
        id: row.id,
        title: row.title,
        image: row.image,
        category: row.category?.name || "Other",
        winningBid: topBid.amount,
        currentPrice: row.currentPrice,
        numberOfBids: row._count.bids,
        seller: row.seller.name,
        status: deriveStatus(row.status, row.startTime, row.endTime),
        endTime: row.endTime.toISOString(),
      });
    }
    return result;
  } catch {
    return [];
  }
}

export async function getAuctionRecord(id) {
  const numericId = Number.parseInt(id, 10);
  if (Number.isNaN(numericId)) return null;
  try {
    return await prisma.auction.findUnique({
      where: { id: numericId },
      include: {
        _count: { select: { bids: true } },
      },
    });
  } catch {
    return null;
  }
}