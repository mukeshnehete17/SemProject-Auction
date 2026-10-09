"use client";

import { useState } from "react";
import Link from "next/link";
import { Gavel, AlertCircle, ArrowUpRight, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function BidPanel({ auction, currentUser, onBid }) {
  const { currentBid = 0, bidIncrement = 100, status, sellerId } = auction;
  const minBid = currentBid + bidIncrement;
  const [bidAmount, setBidAmount] = useState(minBid);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isActive = status === "active" || status === "ending_soon";
  const isOwnAuction = currentUser && sellerId === currentUser.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (bidAmount < minBid) {
      setFormError(`Bid must be at least ${formatPrice(minBid)}`);
      return;
    }

    setSubmitting(true);
    if (onBid) {
      const result = await onBid(bidAmount);
      if (result?.error) setFormError(result.error);
    }
    setSubmitting(false);
  };

  const handleQuickAdd = (increment) => {
    setBidAmount((prev) => Math.max(minBid, (Number(prev) || minBid) + increment));
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* Top Valuation Bar */}
      <div className="flex items-end justify-between border-b border-zinc-100 pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono font-semibold">
            Current High Bid
          </span>
          <p className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-mono tracking-tight mt-0.5">
            {formatPrice(currentBid)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono font-semibold">
            Minimum Next
          </span>
          <p className="text-sm sm:text-base font-bold text-indigo-600 font-mono tracking-tight mt-0.5">
            {formatPrice(minBid)}
          </p>
        </div>
      </div>

      {/* Increments specs */}
      <div className="grid grid-cols-2 gap-3 bg-zinc-50 border border-zinc-200/60 rounded-xl p-3.5 text-xs">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
            Min. Increment
          </span>
          <p className="font-mono font-bold text-zinc-800 mt-0.5">
            {formatPrice(bidIncrement)}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
            Bid Protection
          </span>
          <p className="font-sans font-medium text-emerald-600 mt-0.5 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Active
          </p>
        </div>
      </div>

      {/* Logged-out state */}
      {isActive && !currentUser && (
        <div className="text-center py-6 px-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 space-y-3">
          <p className="text-xs text-zinc-600 font-medium">
            Authentication is required to place authenticated bids on this lot.
          </p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.pathname : `/auctions/${auction.id}`
            )}`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
          >
            <span>Sign In to Bid</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Own auction warning */}
      {isActive && currentUser && isOwnAuction && (
        <div className="text-center py-4 px-4 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-medium">
          You are the seller of this listing. Self-bidding is strictly prohibited.
        </div>
      )}

      {/* Admin warning */}
      {isActive && currentUser && !isOwnAuction && currentUser.role === "ADMIN" && (
        <div className="text-center py-4 px-4 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium">
          Administrative accounts cannot participate in competitive bidding.
        </div>
      )}

      {/* Active bidding form */}
      {isActive && currentUser && !isOwnAuction && currentUser.role !== "ADMIN" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700">
                Your Maximum Bid (INR)
              </label>
              <span className="text-[11px] font-mono text-zinc-400">
                Min {formatPrice(minBid)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 font-mono text-base font-semibold">
                ₹
              </span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={minBid}
                step={bidIncrement}
                className={`w-full rounded-lg border pl-8 pr-4 py-3 text-base font-mono font-bold text-zinc-900 placeholder-zinc-400 focus:outline-none transition-colors ${
                  formError
                    ? "border-rose-400 focus:border-rose-600 focus:ring-1 focus:ring-rose-500"
                    : "border-zinc-300 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                }`}
                placeholder={`Minimum ${formatPrice(minBid)}`}
              />
            </div>
          </div>

          {/* Preset increment chips */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
              Quick:
            </span>
            {[bidIncrement, bidIncrement * 2, bidIncrement * 5].map((inc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickAdd(inc)}
                className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
              >
                +{formatPrice(inc)}
              </button>
            ))}
          </div>

          {(formError || bidAmount < minBid) && (
            <div className="flex items-center gap-2 text-rose-600 text-xs font-medium bg-rose-50 border border-rose-100 rounded-lg p-2.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError || `Bid must be at least ${formatPrice(minBid)}`}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || bidAmount < minBid}
            className="w-full flex items-center justify-center gap-2 bg-zinc-950 text-white text-xs sm:text-sm font-semibold py-3.5 rounded-lg hover:bg-zinc-800 active:bg-zinc-900 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm cursor-pointer"
          >
            <Gavel className="h-4 w-4" />
            <span>{submitting ? "Transacting Bid..." : `Place Official Bid (${formatPrice(bidAmount)})`}</span>
          </button>
        </form>
      )}

      {!isActive && (
        <div className="text-center py-5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 text-xs font-medium">
          Bidding on this lot is currently closed.
        </div>
      )}
    </div>
  );
}