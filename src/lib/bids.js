import { prisma } from "@/lib/prisma";
import { deriveStatus } from "@/lib/auctions";
import { formatPrice } from "@/lib/utils";

/** Whole-rupee ceiling shared by bid and auction price validation. */
export const MAX_PRICE = 1000000000;

/**
 * Normalize a raw bid input to whole rupees.
 * Returns the integer amount, or null when the input is unusable.
 */
export function normalizeBidAmount(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > MAX_PRICE) return null;
  if (!Number.isInteger(n)) return null;
  return n;
}

/**
 * Pure server-authoritative bid policy. Returns an error string when the
 * bid must be rejected, or null when it satisfies every rule.
 * `now` is injectable so tests can freeze time.
 */
export function validateBid({ auction, userId, userRole, amount, now = new Date() }) {
  if (!auction) return "Auction not found.";
  if (auction.status === "CANCELLED") return "This auction has been cancelled.";
  if (now < new Date(auction.startTime)) return "This auction hasn't started yet.";
  if (now >= new Date(auction.endTime)) return "This auction has already ended.";
  if (auction.sellerId === userId) return "You cannot bid on your own auction.";
  if (userRole === "ADMIN") return "Admins cannot place bids.";
  const minimumBid = auction.currentPrice + auction.minimumIncrement;
  if (amount < minimumBid) {
    return `Your bid must be at least ${formatPrice(minimumBid)}.`;
  }
  return null;
}

export async function getBidsByAuction(auctionId) {
  const numericId = Number.parseInt(auctionId, 10);
  if (Number.isNaN(numericId)) return [];

  try {
    const rows = await prisma.bid.findMany({
      where: { auctionId: numericId },
      include: { bidder: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((bid) => ({
      id: bid.id,
      amount: bid.amount,
      bidder: bid.bidder.name,
      createdAt: bid.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getBidsByUser(userId) {
  try {
    const rows = await prisma.bid.findMany({
      where: { bidderId: userId },
      include: {
        auction: {
          select: {
            id: true,
            title: true,
            image: true,
            currentPrice: true,
            startTime: true,
            endTime: true,
            status: true,
            category: { select: { name: true } },
            sellerId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const grouped = new Map();
    for (const bid of rows) {
      const auction = bid.auction;
      if (!auction) continue;

      const entry = grouped.get(auction.id) || {
        auctionId: auction.id,
        auctionTitle: auction.title,
        image: auction.image,
        category: auction.category?.name || "Other",
        highestBid: 0,
        currentBid: auction.currentPrice,
        endTime: auction.endTime.toISOString(),
        status: deriveStatus(auction.status, auction.startTime, auction.endTime),
        bidCount: 0,
        bidIds: [],
      };

      if (bid.amount > entry.highestBid) {
        entry.highestBid = bid.amount;
      }
      entry.bidCount += 1;
      entry.bidIds.push(bid.id);

      if (entry.status === "active" || entry.status === "ending_soon") {
        entry.status =
          entry.highestBid >= auction.currentPrice ? "winning" : "outbid";
      }
      grouped.set(auction.id, entry);
    }

    return Array.from(grouped.values()).map((entry) => ({
      ...entry,
      id: entry.auctionId,
      myBid: entry.highestBid,
    }));
  } catch {
    return [];
  }
}