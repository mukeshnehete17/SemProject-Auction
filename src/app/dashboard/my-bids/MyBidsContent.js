"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { formatPrice } from "@/lib/utils";
import { Eye, Gavel } from "lucide-react";

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
  if (diff <= 0) return "Ended";
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
        <p className="text-gray-500 mt-1">Track your bidding activity</p>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="No bids found"
          description={`You don't have any ${activeTab.toLowerCase()} bids yet.`}
        />
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Auction
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    My Bid
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Current Bid
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Time Left
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((bid) => (
                  <tr key={bid.auctionId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {bid.image ? (
                          <img
                            src={bid.image}
                            alt={bid.auctionTitle}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Gavel className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {bid.auctionTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatPrice(bid.myBid)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatPrice(bid.currentBid)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={bid.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {getTimeRemaining(bid.endTime)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/auctions/${bid.auctionId}`}
                        className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filtered.map((bid) => (
              <div
                key={bid.auctionId}
                className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {bid.image ? (
                    <img
                      src={bid.image}
                      alt={bid.auctionTitle}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Gavel className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {bid.auctionTitle}
                    </p>
                    <StatusBadge status={bid.status} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">My Bid</p>
                    <p className="font-semibold text-gray-900">{formatPrice(bid.myBid)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Current Bid</p>
                    <p className="text-gray-700">{formatPrice(bid.currentBid)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Time Left</p>
                    <p className="text-gray-700">{getTimeRemaining(bid.endTime)}</p>
                  </div>
                  <div className="flex items-end justify-end">
                    <Link
                      href={`/auctions/${bid.auctionId}`}
                      className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View
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