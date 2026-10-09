"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { removeWatchlistAction } from "@/lib/watchlist-actions";
import { Heart, Trash2, Clock, ArrowUpRight } from "lucide-react";

function getTimeRemaining(endTime) {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  if (diff <= 0) return "Auction Closed";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function WatchlistContent({ items }) {
  const { toast } = useToast();
  const router = useRouter();
  const [list, setList] = useState(items);

  const handleRemove = async (auctionId) => {
    const result = await removeWatchlistAction(auctionId);
    if (result?.error) {
      toast(result.error, "error");
      return;
    }
    setList((prev) => prev.filter((entry) => entry.auctionId !== auctionId));
    toast("Lot removed from your watchlist");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200/80 pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
          Saved Lots
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
          My Auction Watchlist
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Catalogued lots saved for active monitoring and bidding entry.
        </p>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your Watchlist is Empty"
          description="Browse live auctions in the catalogue and bookmark lots to monitor their time and price action."
          actionLabel="Explore Catalogue"
          onAction={() => router.push("/auctions")}
        />
      ) : (
        <div className="space-y-3.5">
          {list.map((auction) => (
            <div
              key={auction.auctionId}
              className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-zinc-300 transition-all shadow-2xs"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-200">
                <ImageWithFallback
                  src={auction.image}
                  alt={auction.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  LOT #{String(auction.auctionId).slice(-4).padStart(4, "0")}
                </span>
                <Link
                  href={`/auctions/${auction.auctionId}`}
                  className="text-sm font-bold text-zinc-950 hover:text-indigo-600 transition-colors block truncate"
                >
                  {auction.title}
                </Link>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-sm font-mono font-bold text-zinc-950">
                    {formatPrice(auction.currentPrice)}
                  </span>
                  <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-zinc-400" />
                    {getTimeRemaining(auction.endTime)}
                  </span>
                  <StatusBadge status={auction.status} size="sm" />
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 justify-end">
                <Button href={`/auctions/${auction.auctionId}`} variant="outline" size="sm" className="group">
                  <span>Enter Room</span>
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
                <button
                  onClick={() => handleRemove(auction.auctionId)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove from Watchlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WatchlistContentWithProvider({ items }) {
  return (
    <ToastProvider>
      <WatchlistContent items={items} />
    </ToastProvider>
  );
}