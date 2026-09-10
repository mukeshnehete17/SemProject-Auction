"use client";

import Link from "next/link";
import CountdownTimer from "@/components/ui/CountdownTimer";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatPrice } from "@/lib/utils";
import { Gavel, ArrowRight, Users } from "lucide-react";

export default function HeroAuction({ auction }) {
  return (
    <Link href={`/auctions/${auction.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-[360px] transform transition group-hover:shadow-3xl">
        <div className="relative h-52 bg-gray-50">
          <ImageWithFallback
            src={auction.image}
            alt={auction.title}
            category={auction.category}
            className="h-full"
            imgClassName="group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <StatusBadge status={auction.status} />
          </div>
        </div>
        <div className="p-4">
          <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider mb-0.5">
            {auction.category}
          </p>
          <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-3">
            {auction.title}
          </h3>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider leading-none mb-0.5">
                Current Bid
              </p>
              <p className="text-xl font-bold text-indigo-600 leading-none">
                {formatPrice(auction.currentBid || auction.startingPrice)}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <div className="flex items-center gap-1 text-gray-400 justify-end">
                <Users className="h-3 w-3" />
                <span className="text-[11px] font-medium">{auction.bidCount} bids</span>
              </div>
              <CountdownTimer
                startTime={auction.startTime}
                endTime={auction.endTime}
                status={auction.status}
                className="text-xs"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-600 text-sm font-medium group-hover:gap-2 transition-all">
            <Gavel className="h-3.5 w-3.5" />
            <span>Place a bid</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
