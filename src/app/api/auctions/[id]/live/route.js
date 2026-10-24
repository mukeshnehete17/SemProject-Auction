import { prisma } from "@/lib/prisma";
import { deriveStatus } from "@/lib/auctions";
import { subscribeToAuction } from "@/lib/auction-events";
import { ensureDemoLotsActive } from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  await ensureDemoLotsActive();
  const resolvedParams = await params;
  const numericId = Number.parseInt(resolvedParams.id, 10);
  if (Number.isNaN(numericId)) {
    return new Response("Invalid auction id", { status: 400 });
  }

  // Fetch initial auction data
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
    return new Response("Auction not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial snapshot
      const snapshot = {
        type: "SNAPSHOT",
        auctionId: auction.id,
        currentPrice: auction.currentPrice,
        numberOfBids: auction._count.bids,
        status: deriveStatus(auction.status, auction.startTime, auction.endTime),
        endTime: auction.endTime.toISOString(),
        minimumIncrement: auction.minimumIncrement,
        bids: (auction.bids || []).map((b) => ({
          id: b.id,
          amount: b.amount,
          bidder: b.bidder?.name || "Bidder",
          time: b.createdAt.toISOString(),
        })),
      };

      controller.enqueue(encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`));

      // 2. Subscribe to real-time broadcasts
      const unsubscribe = subscribeToAuction(numericId, (payload) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          // Stream already closed
        }
      });

      // 3. Keep-alive heartbeat ping every 15 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 15000);

      // Clean up when client disconnects
      request.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(pingInterval);
        try {
          controller.close();
        } catch {
          // Ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
