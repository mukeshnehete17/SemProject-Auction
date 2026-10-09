"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { formatPrice } from "@/lib/utils";
import { ArrowUpRight, Gavel } from "lucide-react";

const tabs = ["All", "Active", "Winning", "Lost"];

function getFilteredBids(bids, activeTab) {
  if (activeTab === "All") return bids;
  if (activeTab === "Active") {
    return bids.filter((bid) => bid.status === "winning" || bid.status === "outbid");
  }
  if (activeTab === "Winning") return bids.filter((bid) => bid.status === "winning");
  if (activeTab === "Lost") return bids.filter((bid) => bid.status === "outbid" || bid.status === "ended");
  return bids;
}

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

export default function MyBidsContent({ bids }) {
  const [activeTab, setActiveTab] = useState("All");
  const filtered = getFilteredBids(bids, activeTab);

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200/80 pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
          Ledger Records
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
          My Bidding Ledger
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Monitor your active positions, leading bids, and settled transactions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-xs sm:text-sm font-bold tracking-tight border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? "border-zinc-950 text-zinc-950"
                : "border-transparent text-zinc-400 hover:text-zinc-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No Bids Recorded"
          description={`You do not hold any ${activeTab.toLowerCase()} bids in your history.`}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3.5">Lot Title</th>
                  <th className="px-4 py-3.5">My Highest Bid</th>
                  <th className="px-4 py-3.5">Current Leader</th>
                  <th className="px-4 py-3.5">Standing</th>
                  <th className="px-4 py-3.5">Countdown</th>
                  <th className="px-5 py-3.5 text-right">Auction Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filtered.map((bid) => (
                  <tr key={bid.auctionId} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-200">
                          <ImageWithFallback
                            src={bid.image}
                            alt={bid.auctionTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs font-bold text-zinc-950 truncate max-w-xs">
                          {bid.auctionTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-950 text-sm">
                      {formatPrice(bid.myBid)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-700 font-semibold">
                      {formatPrice(bid.currentBid)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={bid.status} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-500 text-[11px]">
                      {getTimeRemaining(bid.endTime)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/auctions/${bid.auctionId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-indigo-600 transition-colors"
                      >
                        <span>View Lot</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3.5">
            {filtered.map((bid) => (
              <div
                key={bid.auctionId}
                className="bg-white rounded-2xl border border-zinc-200/90 p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-200">
                    <ImageWithFallback
                      src={bid.image}
                      alt={bid.auctionTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-950 truncate">
                      {bid.auctionTitle}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={bid.status} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-zinc-100">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">My Position</span>
                    <p className="font-mono font-bold text-zinc-950 mt-0.5">{formatPrice(bid.myBid)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">Current Leader</span>
                    <p className="font-mono text-zinc-700 mt-0.5">{formatPrice(bid.currentBid)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">Time Left</span>
                    <p className="font-mono text-zinc-600 mt-0.5">{getTimeRemaining(bid.endTime)}</p>
                  </div>
                  <div className="flex items-end justify-end">
                    <Link
                      href={`/auctions/${bid.auctionId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <span>Enter Room</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}