import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveStatus } from "@/lib/auctions";
import { ensureDemoLotsActive } from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  await ensureDemoLotsActive();
  const resolvedParams = await params;
  const numericId = Number.parseInt(resolvedParams.id, 10);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid auction id" }, { status: 400 });
  }

  const auction = await prisma.auction.findUnique({
    where: { id: numericId },
    include: {
      bids: {
        include: { bidder: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { bids: true } },
    },
  });

  if (!auction) {
    return NextResponse.json({ error: "Auction not found" }, { status: 404 });
  }

  const status = deriveStatus(auction.status, auction.startTime, auction.endTime);

  return NextResponse.json({
    auctionId: auction.id,
    currentPrice: auction.currentPrice,
    minimumIncrement: auction.minimumIncrement,
    numberOfBids: auction._count.bids,
    status,
    endTime: auction.endTime.toISOString(),
    bids: (auction.bids || []).map((b) => ({
      id: b.id,
      amount: b.amount,
      bidder: b.bidder?.name || "Bidder",
      time: b.createdAt.toISOString(),
    })),
  });
}
