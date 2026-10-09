import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import CountdownTimer from "@/components/ui/CountdownTimer";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatPrice } from "@/lib/utils";
import { Users, ArrowUpRight } from "lucide-react";

export default function AuctionCard({ auction }) {
  const currentPrice = auction.currentBid || auction.currentPrice || auction.startingPrice;
  const bids = auction.bidCount ?? auction.numberOfBids ?? 0;

  return (
    <Link href={`/auctions/${auction.id}`} className="block group h-full">
      <div className="bg-white rounded-xl border border-zinc-200/90 overflow-hidden hover:border-zinc-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
        {/* Visual Container */}
        <div className="relative h-52 sm:h-56 bg-zinc-100 overflow-hidden">
          <ImageWithFallback
            src={auction.image}
            alt={auction.title}
            category={auction.category}
            className="h-full w-full"
            imgClassName="group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {/* Status Badge floating */}
          <div className="absolute top-3 left-3 z-10">
            <StatusBadge status={auction.status} />
          </div>

          {/* Bid count pill */}
          <div className="absolute top-3 right-3 z-10 bg-zinc-950/70 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
            <Users className="h-3 w-3 text-zinc-400" />
            <span>{bids}</span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-indigo-600">
              {auction.category}
            </span>
            {auction.seller && (
              <span className="text-[11px] text-zinc-400 truncate max-w-[120px]">
                by {auction.seller.name}
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 line-clamp-1 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">
            {auction.title}
          </h3>

          <div className="mt-auto pt-3 border-t border-zinc-100">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mb-0.5">
                  Current Bid
                </p>
                <p className="text-lg sm:text-xl font-bold text-zinc-950 font-mono tracking-tight leading-none">
                  {formatPrice(currentPrice)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mb-0.5">
                  Closing In
                </p>
                <CountdownTimer
                  startTime={auction.startTime}
                  endTime={auction.endTime}
                  status={auction.status}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100/80 text-xs">
              <span className="text-[11px] font-mono text-zinc-400">
                Lot #{String(auction.id).slice(-4).padStart(4, "0")}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-zinc-950 group-hover:text-indigo-600 transition-colors">
                <span>View Lot</span>
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
