"use client";

import { useState } from "react";
import Link from "next/link";
import { Gavel, AlertCircle } from "lucide-react";
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div>
        <p className="text-xs text-gray-500 mb-1">Current Bid</p>
        <p className="text-3xl font-bold text-indigo-600">
          {formatPrice(currentBid)}
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Min. Increment</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(bidIncrement)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Minimum Next Bid</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(minBid)}
          </p>
        </div>
      </div>

      {isActive && !currentUser && (
        <div className="text-center py-3 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">
            Sign in to place a bid
          </p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.pathname : `/auctions/${auction.id}`
            )}`}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Sign in
          </Link>
        </div>
      )}

      {isActive && currentUser && isOwnAuction && (
        <div className="text-center py-3 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600">
            You can&apos;t bid on your own auction
          </p>
        </div>
      )}

      {isActive && currentUser && !isOwnAuction && currentUser.role === "ADMIN" && (
        <div className="text-center py-3 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600">
            Admins cannot place bids
          </p>
        </div>
      )}

      {isActive && currentUser && !isOwnAuction && currentUser.role !== "ADMIN" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Bid (INR)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                ₹
              </span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                min={minBid}
                step={bidIncrement}
                className={`w-full rounded-lg border pl-8 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-colors ${
                  formError
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                }`}
                placeholder={`Minimum ${formatPrice(minBid)}`}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Minimum bid: {formatPrice(minBid)}
          </p>

          {(formError || bidAmount < minBid) && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{formError || `Bid must be at least ${formatPrice(minBid)}`}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || bidAmount < minBid}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Gavel className="h-4 w-4" />
            {submitting ? "Placing bid..." : "Place Bid"}
          </button>
        </form>
      )}

      {!isActive && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 font-medium">
            Bidding is not available
          </p>
        </div>
      )}
    </div>
  );
}