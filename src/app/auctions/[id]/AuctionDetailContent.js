"use client";

import { useState, useEffect } from "react";
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
  CheckCircle2,
  Lock,
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

  // Live polling for cross-user bidding updates when auction is active
  useEffect(() => {
    if (!canBid) return;
    const interval = setInterval(() => {
      router.refresh();
    }, 8000);
    return () => clearInterval(interval);
  }, [canBid, router]);

  const handleBid = async (amount) => {
    const result = await placeBidAction(auction.id, amount);
    if (result?.error) {
      return result;
    }

    toast(`Your official bid of ${formatPrice(amount)} has been transacted!`, "success");
    router.refresh();
    return { ok: true };
  };

  const handleWatchToggle = async () => {
    if (!currentUser) {
      toast("Please sign in to add lots to your watchlist.", "info");
      router.push("/login");
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
    toast(next ? "Lot added to your watchlist" : "Lot removed from watchlist", "success");
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
      toast("Lot direct link copied to clipboard", "info");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Editorial Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-8">
          <Link href="/" className="hover:text-zinc-950 transition-colors">
            TORI
          </Link>
          <span>/</span>
          <Link href="/auctions" className="hover:text-zinc-950 transition-colors">
            Catalogue
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-bold truncate max-w-xs">{auction.title}</span>
        </nav>

        {/* Two-Column Auction Room Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Visual Showcase & Provenance (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-zinc-100 rounded-2xl h-80 sm:h-[460px] relative overflow-hidden border border-zinc-200/90 shadow-xs">
              <ImageWithFallback
                src={auction.image}
                alt={auction.title}
                category={auction.category}
                className="h-full w-full"
                imgClassName="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 z-10">
                <StatusBadge status={auction.status} size="md" />
              </div>

              <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 border border-white/10">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>LOT #{String(auction.id).slice(-4).padStart(4, "0")}</span>
              </div>
            </div>

            {/* Seller / Provenance Card */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-zinc-950 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                  {auction.seller.name?.[0]?.toUpperCase() || "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-950">
                      {auction.seller.name}
                    </p>
                    <span className="text-[10px] font-mono text-zinc-400 bg-white border border-zinc-200 px-2 py-0.5 rounded-full">
                      Verified Seller
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                    <span className="text-amber-500 font-bold">★ {auction.seller.rating || "5.0"}</span>
                    <span>·</span>
                    <span>Member since 2024</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                  Authentication
                </span>
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 justify-end mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Inspected
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Bid Console & Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-b border-zinc-200 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
                  {auction.category}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {auction.numberOfBids || 0} Total Bids
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 leading-tight">
                {auction.title}
              </h1>
            </div>

            {/* Bid Panel Component */}
            <BidPanel
              auction={auction}
              currentUser={currentUser}
              onBid={handleBid}
            />

            {/* Finished or Upcoming State Banners */}
            {!canBid && auction.status === "ended" && (
              winner ? (
                winner.bidderId === currentUser?.id ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
                    <Trophy className="h-10 w-10 text-emerald-600 mx-auto" />
                    <p className="text-base font-bold text-emerald-900">
                      Congratulations! You Won This Lot.
                    </p>
                    <p className="text-xs text-emerald-700 font-mono">
                      Winning valuation: {formatPrice(winner.amount)}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
                    <Trophy className="h-8 w-8 text-amber-600 mx-auto" />
                    <p className="text-sm font-bold text-amber-900">
                      Auction Won by {winner.bidderName}
                    </p>
                    <p className="text-xs text-amber-700 font-mono">
                      Final Hammer Price: {formatPrice(winner.amount)}
                    </p>
                  </div>
                )
              ) : (
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center text-zinc-500 text-xs">
                  This auction has concluded with no reserve bids placed.
                </div>
              )
            )}

            {!canBid && auction.status === "upcoming" && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-center text-indigo-900 text-xs font-medium">
                This lot is scheduled for future bidding. Review specs and add to your watchlist.
              </div>
            )}

            {/* Quick Timing & Specs */}
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  Bidding Window Closes
                </span>
                <CountdownTimer
                  startTime={auction.startTime}
                  endTime={auction.endTime}
                  status={auction.status}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400">
                    Initial Reserve
                  </span>
                  <p className="font-mono font-bold text-zinc-900 mt-0.5">
                    {formatPrice(auction.startingPrice)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400">
                    Settlement Status
                  </span>
                  <p className="font-sans font-medium text-zinc-900 mt-0.5">
                    {getStatusText(auction.status)}
                  </p>
                </div>
              </div>
            </div>

            {/* Watchlist & Share Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleWatchToggle}
                disabled={watchToggling}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer ${
                  isWatchlisted
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "border-zinc-300 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${isWatchlisted ? "fill-rose-500 text-rose-500" : ""}`}
                />
                <span>{isWatchlisted ? "Saved in Watchlist" : "Save Lot"}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-zinc-300 text-xs font-semibold uppercase tracking-wider text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400 transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Escrow & Trust Badges */}
            <div className="border-t border-zinc-100 pt-4 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                <span>Escrow Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-zinc-400" />
                <span>Direct Insured Shipping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Info & Bid History Section */}
        <div className="mt-16 border-t border-zinc-200 pt-10">
          <div className="flex gap-8 border-b border-zinc-200 mb-8">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 text-sm font-bold tracking-tight border-b-2 transition-colors cursor-pointer ${
                activeTab === "description"
                  ? "border-zinc-950 text-zinc-950"
                  : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}
            >
              Description & Provenance
            </button>
            <button
              onClick={() => setActiveTab("bids")}
              className={`pb-4 text-sm font-bold tracking-tight border-b-2 transition-colors cursor-pointer ${
                activeTab === "bids"
                  ? "border-zinc-950 text-zinc-950"
                  : "border-transparent text-zinc-400 hover:text-zinc-700"
              }`}
            >
              Bid Ledger ({auction.bids?.length || 0})
            </button>
          </div>

          {activeTab === "description" && (
            <div className="max-w-3xl space-y-6 text-sm text-zinc-600 leading-relaxed">
              <p className="text-zinc-900 font-medium text-base">
                {auction.description}
              </p>
              <p>
                This lot is catalogued and released exclusively through the TORI verified auction infrastructure. All items undergo rigorous provenance authentication, cosmetic analysis, and functional testing before lot approval.
              </p>

              <div className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                  Lot Specifications
                </h3>
                <ul className="space-y-2 text-xs text-zinc-600 font-mono">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Certified authentic with accompanying documentation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Dispatched within 24-48 business hours after auction close</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span>Compliant with TORI Buyer Protection and Escrow Protocol</span>
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

      <Footer />
    </div>
  );
}