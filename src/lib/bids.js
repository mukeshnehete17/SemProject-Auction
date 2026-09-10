import { prisma } from "@/lib/prisma";
import { deriveStatus } from "@/lib/auctions";

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