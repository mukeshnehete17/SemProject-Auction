import { prisma } from "@/lib/prisma";
import { deriveStatus } from "@/lib/auctions";

/**
 * Authoritative seller analytics query engine.
 * Strictly scopes all metrics to the authenticated sellerId (zero data leakage).
 */
export async function getSellerAnalytics(sellerId) {
  const numericId = Number.parseInt(sellerId, 10);
  if (Number.isNaN(numericId)) return null;

  try {
    const auctions = await prisma.auction.findMany({
      where: { sellerId: numericId },
      include: {
        category: { select: { name: true } },
        bids: {
          include: { bidder: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { bids: true, watchlist: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    let activeAuctions = 0;
    let endedAuctions = 0;
    let upcomingAuctions = 0;
    let cancelledAuctions = 0;
    let totalBidsReceived = 0;
    let totalWatchlistCount = 0;
    let grossVolume = 0;

    const allBids = [];
    const listingsPerformance = [];

    for (const a of auctions) {
      const derived = deriveStatus(a.status, a.startTime, a.endTime);
      if (derived === "active" || derived === "ending_soon") activeAuctions++;
      else if (derived === "ended") endedAuctions++;
      else if (derived === "upcoming") upcomingAuctions++;
      else if (derived === "cancelled") cancelledAuctions++;

      const bidCount = a._count.bids;
      const watchCount = a._count.watchlist;
      totalBidsReceived += bidCount;
      totalWatchlistCount += watchCount;

      const topBid = a.bids[0] || null;
      if (topBid) {
        grossVolume += topBid.amount;
      }

      listingsPerformance.push({
        id: a.id,
        title: a.title,
        image: a.image,
        category: a.category?.name || "Other",
        startingPrice: a.startingPrice,
        currentPrice: a.currentPrice,
        highestBid: topBid ? topBid.amount : a.currentPrice,
        highestBidder: topBid?.bidder?.name || null,
        bidCount,
        watchlistCount: watchCount,
        status: derived,
        endTime: a.endTime.toISOString(),
        createdAt: a.createdAt.toISOString(),
      });

      for (const b of a.bids) {
        allBids.push({
          id: b.id,
          amount: b.amount,
          auctionId: a.id,
          auctionTitle: a.title,
          bidderName: b.bidder?.name || "Bidder",
          createdAt: b.createdAt.toISOString(),
          timestamp: new Date(b.createdAt).getTime(),
        });
      }
    }

    // Sort combined bids chronologically
    allBids.sort((a, b) => b.timestamp - a.timestamp);
    const recentBiddingActivity = allBids.slice(0, 15);

    // Group bids by day over the last 14 days for timeline chart
    const dailyBidsMap = new Map();
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().slice(5, 10); // MM-DD
      dailyBidsMap.set(dateKey, 0);
    }

    for (const b of allBids) {
      const dateKey = b.createdAt.slice(5, 10);
      if (dailyBidsMap.has(dateKey)) {
        dailyBidsMap.set(dateKey, dailyBidsMap.get(dateKey) + 1);
      }
    }

    const bidsOverTime = Array.from(dailyBidsMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    // Group performance by category
    const categoryMap = new Map();
    for (const a of listingsPerformance) {
      const cat = a.category;
      const cur = categoryMap.get(cat) || { count: 0, bids: 0 };
      categoryMap.set(cat, {
        count: cur.count + 1,
        bids: cur.bids + a.bidCount,
      });
    }

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      lotCount: data.count,
      bidsReceived: data.bids,
    }));

    return {
      totalListings: auctions.length,
      activeAuctions,
      endedAuctions,
      upcomingAuctions,
      cancelledAuctions,
      totalBidsReceived,
      totalWatchlistCount,
      grossVolume,
      averageBidsPerLot: auctions.length > 0 ? (totalBidsReceived / auctions.length).toFixed(1) : "0.0",
      listingsPerformance,
      recentBiddingActivity,
      bidsOverTime,
      categoryBreakdown,
    };
  } catch (err) {
    console.error("[TORI Seller Analytics] Error fetching analytics:", err);
    return null;
  }
}
