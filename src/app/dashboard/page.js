import { getCurrentUser } from "@/lib/session";
import { getAuctionsBySeller, getWonAuctionsByUser } from "@/lib/auctions";
import { getBidsByUser } from "@/lib/bids";
import { getWatchlistCount } from "@/lib/watchlist";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import DashboardContent from "./DashboardContent";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const [unreadCount, recentNotifications] = await Promise.all([
    getUnreadNotificationCount(user.id),
    getRecentNotifications(user.id, 5),
  ]);

  const isSeller = user.role === "SELLER" || user.role === "ADMIN";

  let bidsPlaced = 0;
  let activeBids = 0;
  let wonAuctions = 0;
  let watchlistCount = 0;
  let auctionsCreated = 0;
  let activeListings = 0;
  let completedAuctions = 0;
  let recentBids = [];

  if (isSeller) {
    const sellerAuctions = await getAuctionsBySeller(user.id);
    auctionsCreated = sellerAuctions.length;
    activeListings = sellerAuctions.filter(
      (a) => a.status === "active" || a.status === "ending_soon"
    ).length;
    completedAuctions = sellerAuctions.filter(
      (a) => a.status === "ended"
    ).length;
  } else {
    const [bidsPlacedCount, groupedBids, wonList, watchlist] =
      await Promise.all([
        prisma.bid.count({ where: { bidderId: user.id } }),
        getBidsByUser(user.id),
        getWonAuctionsByUser(user.id),
        getWatchlistCount(user.id),
      ]);
    bidsPlaced = bidsPlacedCount;
    activeBids = groupedBids.filter(
      (bid) => bid.status === "winning" || bid.status === "outbid"
    ).length;
    wonAuctions = wonList.length;
    watchlistCount = watchlist;

    const recentBidRows = await prisma.bid.findMany({
      where: { bidderId: user.id },
      include: { auction: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    recentBids = recentBidRows.map((bid) => ({
      auctionId: bid.auction.id,
      title: bid.auction.title,
      amount: bid.amount,
      createdAt: bid.createdAt.toISOString(),
    }));
  }

  return (
    <DashboardContent
      userName={user.name}
      role={user.role}
      bidsPlaced={bidsPlaced}
      activeBids={activeBids}
      wonAuctions={wonAuctions}
      watchlistCount={watchlistCount}
      unreadCount={unreadCount}
      recentNotifications={recentNotifications}
      auctionsCreated={auctionsCreated}
      activeListings={activeListings}
      completedAuctions={completedAuctions}
      recentBids={recentBids}
    />
  );
}