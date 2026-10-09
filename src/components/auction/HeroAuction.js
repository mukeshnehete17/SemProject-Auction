"use client";

import Link from "next/link";
import CountdownTimer from "@/components/ui/CountdownTimer";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatPrice } from "@/lib/utils";
import { ArrowUpRight, Users, ShieldCheck } from "lucide-react";

export default function HeroAuction({ auction }) {
  const currentPrice = auction.currentBid || auction.currentPrice || auction.startingPrice;
  const bids = auction.bidCount ?? auction.numberOfBids ?? 0;

  return (
    <Link href={`/auctions/${auction.id}`} className="block group w-full">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-zinc-700 hover:shadow-indigo-500/10 hover:shadow-2xl text-white">
        {/* Visual Showcase */}
        <div className="relative h-60 sm:h-64 bg-zinc-950 overflow-hidden">
          <ImageWithFallback
            src={auction.image}
            alt={auction.title}
            category={auction.category}
            tone="dark"
            priority={true}
            className="h-full w-full"
            imgClassName="group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          <div className="absolute top-3.5 left-3.5 z-10">
            <StatusBadge status={auction.status} size="sm" />
          </div>

          <div className="absolute top-3.5 right-3.5 z-10 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Users className="h-3 w-3 text-indigo-400" />
            <span>{bids} Bids</span>
          </div>

          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider text-zinc-300">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>Verified Lot #{String(auction.id).slice(-4).padStart(4, "0")}</span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="text-[10px] uppercase tracking-widest font-mono text-indigo-400 font-semibold">
                {auction.category}
              </span>
              <span>Seller: {auction.seller}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-indigo-400 transition-colors">
              {auction.title}
            </h3>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                Current Valuation
              </p>
              <p className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
                {formatPrice(currentPrice)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-0.5">
                Time Remaining
              </p>
              <CountdownTimer
                startTime={auction.startTime}
                endTime={auction.endTime}
                status={auction.status}
                className="text-white text-xs justify-end"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-zinc-400 font-medium">
              Start: {formatPrice(auction.startingPrice)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">
              <span>Enter Bidding Room</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
