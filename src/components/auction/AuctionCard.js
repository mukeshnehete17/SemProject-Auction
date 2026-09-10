import Link from "next/link";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import CountdownTimer from "@/components/ui/CountdownTimer";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatPrice } from "@/lib/utils";
import { Users, ArrowRight } from "lucide-react";

export default function AuctionCard({ auction }) {
  return (
    <Link href={`/auctions/${auction.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col h-full">
        <div className="relative h-[180px] bg-gray-50 overflow-hidden">
          <ImageWithFallback
            src={auction.image}
            alt={auction.title}
            category={auction.category}
            className="h-full w-full"
            imgClassName="group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 left-2.5">
            <StatusBadge status={auction.status} />
          </div>
        </div>

        <div className="p-3.5 flex flex-col flex-1">
          <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider mb-0.5">
            {auction.category}
          </p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">
            {auction.title}
          </h3>
          {auction.seller && (
            <p className="text-[11px] text-gray-400 mb-2.5">
              by {auction.seller.name}
            </p>
          )}

          <div className="mt-auto">
            <div className="flex items-end justify-between mb-2.5">
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider leading-none mb-0.5">
                  Current Bid
                </p>
                <p className="text-lg font-bold text-indigo-600 leading-none">
                  {formatPrice(auction.currentBid || auction.startingPrice)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Users className="h-3 w-3" />
                <span className="text-[11px] font-medium">
                  {auction.bidCount ?? auction.numberOfBids ?? 0}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
              <CountdownTimer
                startTime={auction.startTime}
                endTime={auction.endTime}
                status={auction.status}
                className="text-[11px]"
              />
              <span className="text-[11px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                View <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
