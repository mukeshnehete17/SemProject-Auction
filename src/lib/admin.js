import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { deriveStatus, buildStatusWhere } from "@/lib/auctions";
import { redirect } from "next/navigation";

export async function getAdminUser() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/unauthorized");
  return user;
}

export async function getAdminStats() {
  const [users, categories, bids, auctions] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.category.count(),
    prisma.bid.count(),
    prisma.auction.count(),
  ]);

  const [active, endingSoon, upcoming, ended, cancelled] = await Promise.all([
    prisma.auction.count({ where: buildStatusWhere("active") }),
    prisma.auction.count({ where: buildStatusWhere("ending_soon") }),
    prisma.auction.count({ where: buildStatusWhere("upcoming") }),
    prisma.auction.count({ where: buildStatusWhere("ended") }),
    prisma.auction.count({ where: { status: "CANCELLED" } }),
  ]);

  const roles = {
    BUYER: 0,
    SELLER: 0,
    ADMIN: 0,
  };
  for (const row of users) {
    roles[row.role] = row._count._all;
  }

  return {
    totalUsers: users.reduce((sum, row) => sum + row._count._all, 0),
    buyers: roles.BUYER,
    sellers: roles.SELLER,
    admins: roles.ADMIN,
    totalAuctions: auctions,
    totalBids: bids,
    totalCategories: categories,
    auctionStatus: { active, endingSoon, upcoming, ended, cancelled },
  };
}

export async function getAdminUsers({ search } = {}) {
  const where = {};
  const query = typeof search === "string" ? search.trim() : "";
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { email: { contains: query } },
    ];
  }

  const rows = await prisma.user.findMany({
    where,
    include: {
      _count: { select: { auctions: true, bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const endedRows = await prisma.auction.findMany({
    where: { status: { not: "CANCELLED" }, endTime: { lte: new Date() } },
    select: {
      bids: { orderBy: { amount: "desc" }, take: 1, select: { bidderId: true } },
    },
  });

  const wonCounts = {};
  for (const row of endedRows) {
    if (row.bids[0]) {
      wonCounts[row.bids[0].bidderId] = (wonCounts[row.bids[0].bidderId] || 0) + 1;
    }
  }

  return rows.map((user) => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      auctionsCreated: user._count.auctions,
      bidsPlaced: user._count.bids,
      auctionsWon: wonCounts[user.id] || 0,
    };
  });
}

export async function getAdminAuctions({ search, status } = {}) {
  const where = {};

  const query = typeof search === "string" ? search.trim() : "";
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
    ];
  }

  if (status && status !== "all") {
    const statusWhere = buildStatusWhere(status);
    if (statusWhere) Object.assign(where, statusWhere);
  }

  const rows = await prisma.auction.findMany({
    where,
    include: {
      seller: { select: { id: true, name: true } },
      category: { select: { name: true } },
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
        select: { id: true, amount: true, bidder: { select: { name: true } } },
      },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => {
    const derived = deriveStatus(row.status, row.startTime, row.endTime);
    const topBid = row.bids[0] || null;
    return {
      id: row.id,
      title: row.title,
      image: row.image,
      category: row.category?.name || "Other",
      seller: row.seller ? { id: row.seller.id, name: row.seller.name } : null,
      currentPrice: row.currentPrice,
      startingPrice: row.startingPrice,
      numberOfBids: row._count.bids,
      status: derived,
      startTime: row.startTime.toISOString(),
      endTime: row.endTime.toISOString(),
      winner:
        derived === "ended" && topBid
          ? { name: topBid.bidder.name, amount: topBid.amount }
          : null,
    };
  });
}

export async function getAdminReports() {
  const stats = await getAdminStats();

  const [bidMax, auctionAgg] = await Promise.all([
    prisma.bid.aggregate({ _max: { amount: true }, _avg: { amount: true } }),
    prisma.auction.aggregate({ _sum: { currentPrice: true } }),
  ]);

  const categoryRows = await prisma.category.findMany({
    select: {
      name: true,
      _count: { select: { auctions: true } },
    },
    orderBy: { auctions: { _count: "desc" } },
    take: 5,
  });

  const sellerRows = await prisma.auction.groupBy({
    by: ["sellerId"],
    _count: { _all: true },
    orderBy: { _count: { sellerId: "desc" } },
    take: 5,
  });

  let topSellers = [];
  if (sellerRows.length) {
    const sellers = await prisma.user.findMany({
      where: { id: { in: sellerRows.map((row) => row.sellerId) } },
      select: { id: true, name: true },
    });
    const byId = new Map(sellers.map((seller) => [seller.id, seller.name]));
    topSellers = sellerRows.map((row) => ({
      name: byId.get(row.sellerId) || "Unknown",
      count: row._count._all,
    }));
  }

  const bidderRows = await prisma.bid.groupBy({
    by: ["bidderId"],
    _count: { _all: true },
    orderBy: { _count: { bidderId: "desc" } },
    take: 5,
  });

  let topBidders = [];
  if (bidderRows.length) {
    const bidders = await prisma.user.findMany({
      where: { id: { in: bidderRows.map((row) => row.bidderId) } },
      select: { id: true, name: true },
    });
    const byId = new Map(bidders.map((bidder) => [bidder.id, bidder.name]));
    topBidders = bidderRows.map((row) => ({
      name: byId.get(row.bidderId) || "Unknown",
      count: row._count._all,
    }));
  }

  return {
    ...stats,
    avgBid: bidMax._avg.amount,
    highestBid: bidMax._max.amount,
    totalListingsValue: auctionAgg._sum.currentPrice,
    topCategories: categoryRows.map((row) => ({
      name: row.name,
      count: row._count.auctions,
    })),
    topSellers,
    topBidders,
  };
}