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
  Radio,
} from "lucide-react";

export default function AuctionDetailContent({
  auction: initialAuction,
  currentUser,
  winner,
  isWatched: initialWatched,
}) {
  const { toast } = useToast();
  const router = useRouter();

  // Reactive state updated by SSE and polling
  const [liveAuction, setLiveAuction] = useState({
    ...initialAuction,
    currentBid: initialAuction.currentBid,
    numberOfBids: initialAuction.numberOfBids,
    status: initialAuction.status,
    endTime: initialAuction.endTime,
    bids: initialAuction.bids || [],
  });

  const [connectionMode, setConnectionMode] = useState("CONNECTING"); // "LIVE", "POLLING"
  const isEnded = liveAuction.status === "ended" || liveAuction.status === "cancelled";
  const syncStatus = isEnded ? "ENDED" : connectionMode;

  const [activeTab, setActiveTab] = useState("description");
  const [isWatchlisted, setIsWatchlisted] = useState(initialWatched);
  const [watchToggling, setWatchToggling] = useState(false);

  // Multi-image gallery state
  const galleryImages =
    initialAuction.images && initialAuction.images.length > 0
      ? initialAuction.images
      : [initialAuction.image].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(galleryImages[0] || initialAuction.image);

  const canBid = liveAuction.status === "active" || liveAuction.status === "ending_soon";

  // Real-Time Server-Sent Events (SSE) Stream with Polling Fallback
  useEffect(() => {
    if (isEnded) {
      return;
    }

    let eventSource = null;
    let pollInterval = null;

    try {
      eventSource = new EventSource(`/api/auctions/${initialAuction.id}/live`);

      eventSource.onopen = () => {
        setConnectionMode("LIVE");
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "SNAPSHOT") {
            setLiveAuction((prev) => ({
              ...prev,
              currentBid: data.currentPrice,
              numberOfBids: data.numberOfBids,
              status: data.status,
              endTime: data.endTime,
              bids: data.bids || prev.bids,
            }));
            setConnectionMode("LIVE");
          } else if (data.type === "NEW_BID") {
            setLiveAuction((prev) => ({
              ...prev,
              currentBid: data.currentPrice,
              numberOfBids: data.numberOfBids,
              bids: [data.newBid, ...prev.bids.filter((b) => b.id !== data.newBid.id)],
            }));
            if (data.newBid?.bidder && data.newBid.bidder !== currentUser?.name) {
              toast(
                `New bid of ${formatPrice(data.newBid.amount)} registered from ${data.newBid.bidder}`,
                "info"
              );
            }
          } else if (data.type === "AUCTION_ENDED" || data.type === "AUCTION_CANCELLED") {
            setLiveAuction((prev) => ({ ...prev, status: data.status }));
            router.refresh();
          }
        } catch {
          // ignore non-json pings
        }
      };

      eventSource.onerror = () => {
        if (eventSource) eventSource.close();
        setConnectionMode("POLLING");

        // Polling fallback
        pollInterval = setInterval(async () => {
          try {
            const res = await fetch(`/api/auctions/${initialAuction.id}/poll`);
            if (res.ok) {
              const pollData = await res.json();
              setLiveAuction((prev) => ({
                ...prev,
                currentBid: pollData.currentPrice,
                numberOfBids: pollData.numberOfBids,
                status: pollData.status,
                endTime: pollData.endTime,
                bids: pollData.bids || prev.bids,
              }));
              if (pollData.status === "ended" || pollData.status === "cancelled") {
                clearInterval(pollInterval);
                router.refresh();
              }
            }
          } catch {
            // Polling error
          }
        }, 4000);
      };
    } catch {
      setTimeout(() => setConnectionMode("POLLING"), 0);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [initialAuction.id, currentUser?.name, isEnded, router, toast]);

  const handleBid = async (amount) => {
    const result = await placeBidAction(initialAuction.id, amount);
    if (result?.error) {
      return result;
    }

    // Optimistically update live bid
    setLiveAuction((prev) => ({
      ...prev,
      currentBid: amount,
      numberOfBids: (prev.numberOfBids || 0) + 1,
      bids: [
        {
          id: result.bidId || Date.now(),
          amount,
          bidder: currentUser?.name || "You",
          time: new Date().toISOString(),
        },
        ...prev.bids,
      ],
    }));

    toast(`Your official bid of ${formatPrice(amount)} has been transacted!`, "success");
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
    const result = await action(initialAuction.id);
    setWatchToggling(false);
    if (result?.error) {
      toast(result.error, "error");
      return;
    }
    const next = !isWatchlisted;
    setIsWatchlisted(next);
    toast(next ? "Lot added to your watchlist" : "Lot removed from watchlist", "success");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: initialAuction.title,
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
        {/* Editorial Breadcrumbs & Live Connection Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
            <Link href="/" className="hover:text-zinc-950 transition-colors">
              TORI
            </Link>
            <span>/</span>
            <Link href="/auctions" className="hover:text-zinc-950 transition-colors">
              Catalogue
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-bold truncate max-w-xs">{initialAuction.title}</span>
          </nav>

          {/* Live Sync Status Pill */}
          <div className="flex items-center gap-2">
            {syncStatus === "LIVE" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                LIVE SSE STREAM
              </span>
            )}
            {syncStatus === "POLLING" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                POLLING SYNC
              </span>
            )}
            {syncStatus === "ENDED" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                HAMMER FALLEN
              </span>
            )}
          </div>
        </div>

        {/* Two-Column Auction Room Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Visual Showcase & Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-zinc-100 rounded-2xl h-80 sm:h-[460px] relative overflow-hidden border border-zinc-200/90 shadow-xs">
              <ImageWithFallback
                src={selectedImage}
                alt={initialAuction.title}
                category={initialAuction.category}
                className="h-full w-full"
                imgClassName="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4 z-10">
                <StatusBadge status={liveAuction.status} size="md" />
              </div>

              <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 border border-white/10">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>LOT #{String(initialAuction.id).slice(-4).padStart(4, "0")}</span>
              </div>
            </div>

            {/* Multi-Image Gallery Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {galleryImages.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImage === img
                        ? "border-indigo-600 ring-2 ring-indigo-600/30 scale-102"
                        : "border-zinc-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      category={initialAuction.category}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Seller / Provenance Card */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 sm:p-6 flex items-center justify-between mt-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-zinc-950 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                  {initialAuction.seller.name?.[0]?.toUpperCase() || "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-950">
                      {initialAuction.seller.name}
                    </p>
                    <span className="text-[10px] font-mono text-zinc-400 bg-white border border-zinc-200 px-2 py-0.5 rounded-full">
                      Verified Seller
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                    <span className="text-amber-500 font-bold">★ {initialAuction.seller.rating || "5.0"}</span>
                    <span>·</span>
                    <span>Consignor since 2024</span>
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

          {/* Right Column: Title, Live Bid Console & Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-b border-zinc-200 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
                  {initialAuction.category}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  {liveAuction.numberOfBids || 0} Total Bids
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 leading-tight">
                {initialAuction.title}
              </h1>
            </div>

            {/* Live Synchronized Bid Panel */}
            <BidPanel
              auction={{
                ...initialAuction,
                currentBid: liveAuction.currentBid,
                status: liveAuction.status,
              }}
              currentUser={currentUser}
              onBid={handleBid}
            />

            {/* Finished or Upcoming State Banners */}
            {!canBid && liveAuction.status === "ended" && (
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

            {!canBid && liveAuction.status === "upcoming" && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-center text-indigo-900 text-xs font-medium">
                This lot is scheduled for future bidding. Review specs and bookmark to your watchlist.
              </div>
            )}

            {/* Quick Timing & Specs */}
            <div className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  Bidding Window Closes
                </span>
                <CountdownTimer
                  startTime={initialAuction.startTime}
                  endTime={liveAuction.endTime}
                  status={liveAuction.status}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400">
                    Initial Reserve
                  </span>
                  <p className="font-mono font-bold text-zinc-900 mt-0.5">
                    {formatPrice(initialAuction.startingPrice)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400">
                    Settlement Status
                  </span>
                  <p className="font-sans font-medium text-zinc-900 mt-0.5">
                    {getStatusText(liveAuction.status)}
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

        {/* Tabbed Info & Live Bid History Section */}
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
              Live Bid Ledger ({liveAuction.bids?.length || 0})
            </button>
          </div>

          {activeTab === "description" && (
            <div className="max-w-3xl space-y-6 text-sm text-zinc-600 leading-relaxed">
              <p className="text-zinc-900 font-medium text-base">
                {initialAuction.description}
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
              <BidHistory bids={liveAuction.bids || []} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}