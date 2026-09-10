"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CountdownTimer from "@/components/ui/CountdownTimer";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import BidHistory from "@/components/auction/BidHistory";
import BidPanel from "@/components/auction/BidPanel";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, getStatusText } from "@/lib/utils";
import { placeBidAction } from "@/lib/auction-actions";
import {
  addWatchlistAction,
  removeWatchlistAction,
} from "@/lib/watchlist-actions";
import Link from "next/link";
import {
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  User,
  Tag,
  Trophy,
} from "lucide-react";

export default function AuctionDetailContent({
  auction: initialAuction,
  currentUser,
  winner,
  isWatched: initialWatched,
}) {
  const { toast } = useToast();
  const router = useRouter();

  const auction = initialAuction;
  const [activeTab, setActiveTab] = useState("description");
  const [isWatchlisted, setIsWatchlisted] = useState(initialWatched);
  const [watchToggling, setWatchToggling] = useState(false);

  const canBid = auction.status === "active" || auction.status === "ending_soon";

  const handleBid = async (amount) => {
    const result = await placeBidAction(auction.id, amount);
    if (result?.error) {
      return result;
    }

    toast(`Your bid of ${formatPrice(amount)} has been placed!`, "success");
    router.refresh();
    return { ok: true };
  };

  const handleWatchToggle = async () => {
    if (!currentUser) {
      toast("Please sign in to add items to your watchlist.", "info");
      window.location.href = "/login";
      return;
    }
    setWatchToggling(true);
    const action = isWatchlisted ? removeWatchlistAction : addWatchlistAction;
    const result = await action(auction.id);
    setWatchToggling(false);
    if (result?.error) {
      toast(result.error, "error");
      return;
    }
    const next = !isWatchlisted;
    setIsWatchlisted(next);
    toast(next ? "Added to watchlist!" : "Removed from watchlist", "success");
    router.refresh();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: auction.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast("Link copied to clipboard!", "info");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/auctions"
            className="hover:text-gray-900 transition-colors"
          >
            Auctions
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{auction.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6">
            <div className="bg-gray-100 rounded-xl h-80 sm:h-96 relative overflow-hidden">
              <ImageWithFallback
                src={auction.image}
                alt={auction.title}
                category={auction.category}
                className="h-full w-full"
              />
              <div className="absolute top-4 left-4">
                <span className="inline-block bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-3 py-1.5 rounded-full">
                  {auction.category}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {auction.seller.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-yellow-500">★</span>
                    <span>{auction.seller.rating}</span>
                    <span>·</span>
                    <span>Member since 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <StatusBadge status={auction.status} size="md" />
              <h1 className="mt-3 text-2xl font-bold text-gray-900">
                {auction.title}
              </h1>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                <Tag className="h-3 w-3" />
                {auction.category}
              </div>
            </div>

            <BidPanel
              auction={auction}
              currentUser={currentUser}
              onBid={handleBid}
            />

            {!canBid && auction.status === "ended" && (
              winner ? (
                winner.bidderId === currentUser?.id ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                    <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-green-800">
                      🎉 Congratulations! You won this auction for{" "}
                      {formatPrice(winner.amount)}.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                    <Trophy className="h-7 w-7 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-amber-800">
                      Auction Winner — {winner.bidderName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Winning bid: {formatPrice(winner.amount)}
                    </p>
                  </div>
                )
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    This auction has ended
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    No bids were placed on this auction.
                  </p>
                </div>
              )
            )}

            {!canBid && auction.status === "upcoming" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <p className="text-sm font-semibold text-blue-700">
                  This auction hasn&apos;t started yet
                </p>
              </div>
            )}

            {auction.status === "cancelled" && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-sm font-semibold text-gray-700">
                  This auction has been cancelled
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Bids</p>
                <p className="text-lg font-bold text-gray-900">
                  {auction.numberOfBids || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="text-sm font-semibold text-gray-900">
                  {getStatusText(auction.status)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Time Remaining
              </p>
              <CountdownTimer
                startTime={auction.startTime}
                endTime={auction.endTime}
                status={auction.status}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleWatchToggle}
                disabled={watchToggling}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60 ${
                  isWatchlisted
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isWatchlisted ? "fill-red-500" : ""}`}
                />
                {isWatchlisted ? "Watching" : "Watch"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">Secure Bidding</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-700">Free Delivery</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex gap-6 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "description"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("bids")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "bids"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Bid History ({auction.bids?.length || 0})
            </button>
          </div>

          {activeTab === "description" && (
            <div className="max-w-3xl space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {auction.description}
              </p>
              <p className="text-gray-700 leading-relaxed">
                This item is being sold through our verified auction platform.
                All items are inspected for authenticity and quality before
                listing. The seller has been a trusted member of our community
                with a consistent track record of timely deliveries and accurate
                item descriptions.
              </p>
              <div className="bg-gray-50 rounded-xl p-5 mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Key Specifications
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Brand new, sealed in original packaging
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Manufacturer warranty included
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    Ships within 2-3 business days of auction close
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    7-day return policy for defective items
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "bids" && (
            <div className="max-w-3xl">
              <BidHistory bids={auction.bids || []} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}