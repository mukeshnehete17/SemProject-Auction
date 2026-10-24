import { prisma } from "@/lib/prisma";

/**
 * Persist an immutable audit log entry.
 * Sensitive data (passwords, tokens) must never be passed in metadata.
 */
export async function createAuditLog({
  action,
  entityType,
  entityId = null,
  actorId = null,
  metadata = null,
  tx = null,
}) {
  const client = tx || prisma;
  try {
    const metaString =
      typeof metadata === "string"
        ? metadata
        : metadata
        ? JSON.stringify(metadata)
        : null;

    return await client.auditLog.create({
      data: {
        action,
        entityType,
        entityId: entityId ? Number(entityId) : null,
        actorId: actorId ? Number(actorId) : null,
        metadata: metaString,
      },
    });
  } catch (err) {
    console.error("[TORI Audit] Failed to record audit log:", err);
    return null;
  }
}

/**
 * Fetch audit logs with filtering and actor details for administrator review.
 */
export async function getAuditLogs({ limit = 50, action = null, entityType = null } = {}) {
  const where = {};
  if (action && action !== "all") where.action = action;
  if (entityType && entityType !== "all") where.entityType = entityType;

  try {
    const rows = await prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

    return rows.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      actorId: log.actorId,
      actorName: log.actor?.name || "System",
      actorEmail: log.actor?.email || null,
      actorRole: log.actor?.role || "SYSTEM",
      metadata: log.metadata ? safeParseJson(log.metadata) : null,
      createdAt: log.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("[TORI Audit] Error fetching audit logs:", err);
    return [];
  }
}

function safeParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

/**
 * Scan recent bidding activity and flag patterns for manual admin review.
 * Per specification: "Do not label a user fraudulent based only on an automated flag."
 */
export async function getSuspiciousBiddingFlags() {
  const flags = [];

  try {
    // 1. Check for rapid bidding: Users placing >= 3 bids within 30 seconds on the same auction
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentBids = await prisma.bid.findMany({
      where: { createdAt: { gte: thirtyMinutesAgo } },
      include: {
        bidder: { select: { id: true, name: true, email: true } },
        auction: { select: { id: true, title: true, startingPrice: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Group bids by auction + bidder
    const userAuctionBids = new Map();
    for (const bid of recentBids) {
      const key = `${bid.bidderId}_${bid.auctionId}`;
      if (!userAuctionBids.has(key)) {
        userAuctionBids.set(key, []);
      }
      userAuctionBids.get(key).push(bid);
    }

    for (const [key, bids] of userAuctionBids.entries()) {
      if (bids.length >= 3) {
        // Check time difference between newest and oldest of these bids
        const newest = new Date(bids[0].createdAt).getTime();
        const oldest = new Date(bids[bids.length - 1].createdAt).getTime();
        const diffSeconds = (newest - oldest) / 1000;

        if (diffSeconds <= 45) {
          flags.push({
            id: `rapid_${key}`,
            flagType: "HIGH_FREQUENCY_BIDDING",
            severity: "MEDIUM",
            auctionId: bids[0].auctionId,
            auctionTitle: bids[0].auction.title,
            userId: bids[0].bidderId,
            userName: bids[0].bidder.name,
            userEmail: bids[0].bidder.email,
            reason: `${bids.length} bids placed in ${Math.round(diffSeconds)} seconds. Possible script/bot activity.`,
            timestamp: bids[0].createdAt.toISOString(),
          });
        }
      }
    }

    // 2. Check for self-outbidding: consecutive bids by the same user with no competing bids
    const auctionsWithRecentBids = await prisma.auction.findMany({
      where: {
        bids: { some: { createdAt: { gte: thirtyMinutesAgo } } },
      },
      select: {
        id: true,
        title: true,
        bids: {
          orderBy: { createdAt: "desc" },
          take: 4,
          include: { bidder: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    for (const a of auctionsWithRecentBids) {
      if (a.bids.length >= 2) {
        if (a.bids[0].bidderId === a.bids[1].bidderId) {
          flags.push({
            id: `consecutive_${a.id}_${a.bids[0].bidderId}`,
            flagType: "CONSECUTIVE_SELF_BIDDING",
            severity: "LOW",
            auctionId: a.id,
            auctionTitle: a.title,
            userId: a.bids[0].bidderId,
            userName: a.bids[0].bidder.name,
            userEmail: a.bids[0].bidder.email,
            reason: `User placed consecutive bids without an intervening competitor bid.`,
            timestamp: a.bids[0].createdAt.toISOString(),
          });
        }
      }
    }

    // 3. Check for massive bid jumps (e.g. >= 5x starting price in a single bid)
    for (const bid of recentBids) {
      if (bid.auction && bid.amount >= bid.auction.startingPrice * 5 && bid.auction.startingPrice > 100) {
        flags.push({
          id: `jump_${bid.id}`,
          flagType: "ABNORMAL_BID_SPIKE",
          severity: "MEDIUM",
          auctionId: bid.auctionId,
          auctionTitle: bid.auction.title,
          userId: bid.bidderId,
          userName: bid.bidder.name,
          userEmail: bid.bidder.email,
          reason: `Bid amount (₹${bid.amount}) is more than 5x the starting reserve (₹${bid.auction.startingPrice}).`,
          timestamp: bid.createdAt.toISOString(),
        });
      }
    }

    return flags;
  } catch (err) {
    console.error("[TORI Audit] Error detecting suspicious bidding:", err);
    return [];
  }
}
