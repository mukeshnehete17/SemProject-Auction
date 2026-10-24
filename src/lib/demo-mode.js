import { prisma } from "@/lib/prisma";

export const DEMO_LOTS = [
  {
    title: "ApexBook Ultra 16 OLED",
    durationDays: 4,
    startingPrice: 115000,
    minIncrement: 2000,
  },
  {
    title: "MacBook Air M2",
    durationDays: 4,
    startingPrice: 65000,
    minIncrement: 1000,
  },
  {
    title: "Aether Phone Pro Max 512GB",
    durationDays: 3,
    startingPrice: 89000,
    minIncrement: 1500,
  },
  {
    title: "iPhone 15 Pro Max",
    durationDays: 3,
    startingPrice: 95000,
    minIncrement: 1500,
  },
  {
    title: "Vanguard DeepSea Chronometer 300M",
    durationDays: 5,
    startingPrice: 240000,
    minIncrement: 5000,
  },
  {
    title: "NovaStation X Pro Console & Dual Controllers",
    durationDays: 2,
    startingPrice: 42000,
    minIncrement: 1000,
  },
  {
    title: "Air Heritage 'Chicago 85' Collector Edition",
    durationHours: 18,
    startingPrice: 28000,
    minIncrement: 1000,
  },
  {
    title: "PlayStation 5",
    durationDays: 4,
    startingPrice: 38000,
    minIncrement: 1000,
  },
];

const DEMO_TITLES = new Set(DEMO_LOTS.map((d) => d.title.toLowerCase()));

export function isDemoLot(title) {
  if (!title || typeof title !== "string") return false;
  return DEMO_TITLES.has(title.trim().toLowerCase());
}

let lastCheckTime = 0;
const CHECK_THROTTLE_MS = 60 * 1000; // Throttle to at most once per minute per serverless worker

/**
 * Ensures designated demo auction lots have active start/end timestamps
 * in the database for live demonstration without touching unrelated auctions,
 * existing user accounts, or legitimate bids.
 */
export async function ensureDemoLotsActive(force = false) {
  const now = Date.now();
  if (!force && now - lastCheckTime < CHECK_THROTTLE_MS) {
    return;
  }
  lastCheckTime = now;

  try {
    const titles = DEMO_LOTS.map((d) => d.title);
    const existingLots = await prisma.auction.findMany({
      where: {
        title: { in: titles },
      },
      select: {
        id: true,
        title: true,
        status: true,
        startTime: true,
        endTime: true,
      },
    });

    const lotByTitle = new Map();
    for (const lot of existingLots) {
      lotByTitle.set(lot.title.toLowerCase(), lot);
    }

    for (const spec of DEMO_LOTS) {
      const lot = lotByTitle.get(spec.title.toLowerCase());
      if (!lot) continue;

      const endMs = new Date(lot.endTime).getTime();
      const hoursRemaining = (endMs - now) / (3600 * 1000);

      // If the lot has already ended, or is about to expire (< 1 hour remaining),
      // slide its window forward so the presentation is never blocked by an expired lot.
      if (lot.status !== "ACTIVE" || hoursRemaining <= 1) {
        const targetEnd = spec.durationHours
          ? new Date(now + spec.durationHours * 3600 * 1000)
          : new Date(now + (spec.durationDays || 3) * 24 * 3600 * 1000);

        await prisma.auction.update({
          where: { id: lot.id },
          data: {
            startTime: new Date(now - 2 * 24 * 3600 * 1000),
            endTime: targetEnd,
            status: "ACTIVE",
          },
        });
      }
    }
  } catch (err) {
    // Non-fatal warning: never crash the request if database is temporarily unavailable
    console.warn("[TORI Demo Mode] ensureDemoLotsActive warning:", err?.message || err);
  }
}
