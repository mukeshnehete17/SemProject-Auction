"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { removeWatchlistAction } from "@/lib/watchlist-actions";
import { Heart, Eye, Trash2, Clock } from "lucide-react";

function getTimeRemaining(endTime) {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  if (diff <= 0) return "Ended";
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
    toast("Removed from watchlist");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Watchlist</h1>
        <p className="text-gray-500 mt-1">Auctions you&apos;re watching</p>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your watchlist is empty"
          description="Start browsing auctions and add items to your watchlist."
          actionLabel="Explore Auctions"
          onAction={() => (window.location.href = "/auctions")}
        />
      ) : (
        <div className="space-y-3">
          {list.map((auction) => (
            <div
              key={auction.auctionId}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                {auction.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <Heart className="h-6 w-6 text-red-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/auctions/${auction.auctionId}`}
                  className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {auction.title}
                </Link>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(auction.currentPrice)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeRemaining(auction.endTime)}
                  </span>
                  <StatusBadge status={auction.status} size="sm" />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/auctions/${auction.auctionId}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(auction.auctionId)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
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