"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  Gavel,
  Eye,
  TrendingUp,
  IndianRupee,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
} from "lucide-react";

export default function SellerAnalyticsContent({ analytics, userName }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (!analytics) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl flex items-center gap-3">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">
          Unable to aggregate portfolio metrics. Please verify database connectivity.
        </p>
      </div>
    );
  }

  const {
    totalListings,
    activeAuctions,
    endedAuctions,
    totalBidsReceived,
    totalWatchlistCount,
    grossVolume,
    averageBidsPerLot,
    listingsPerformance,
    recentBiddingActivity,
    bidsOverTime,
    categoryBreakdown,
  } = analytics;

  const maxDailyBids = Math.max(1, ...bidsOverTime.map((d) => d.count));

  const filteredListings =
    selectedCategory === "all"
      ? listingsPerformance
      : listingsPerformance.filter((l) => l.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
          Consignor Portfolio Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
          Seller Analytics & Performance
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Live bidding volume, valuation performance, and collector engagement across your consignments.
        </p>
      </div>

      {/* Top 5 Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Total Listed
            </span>
            <Package className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {totalListings}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>{activeAuctions} currently active</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Bids Received
            </span>
            <Gavel className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {totalBidsReceived}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Avg <span className="font-semibold text-zinc-900">{averageBidsPerLot}</span> bids per lot
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Watchlist Interest
            </span>
            <Eye className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {totalWatchlistCount}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Prospective buyer bookmarks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Gross Valuation
            </span>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight truncate">
            {formatPrice(grossVolume)}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Combined winning & top bids</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-zinc-400 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Settled Lots
            </span>
            <CheckCircle2 className="h-4 w-4 text-zinc-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {endedAuctions}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Completed bidding windows</p>
        </div>
      </div>

      {/* Two Column Section: Timeline Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 14-Day Activity Histogram (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-zinc-950 tracking-tight">
                14-Day Bidding Velocity
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Real bid volume transacted across all your lots
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200">
              Daily Count
            </span>
          </div>

          {/* SVG/Bar Chart */}
          <div className="h-52 w-full flex items-end gap-2 pt-6 pb-2 border-b border-zinc-100">
            {bidsOverTime.map((item) => {
              const heightPercent = Math.max(6, Math.round((item.count / maxDailyBids) * 100));
              return (
                <div
                  key={item.date}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] font-mono py-0.5 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-xs">
                    {item.count} bids on {item.date}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      item.count > 0
                        ? "bg-indigo-600 group-hover:bg-indigo-500"
                        : "bg-zinc-100"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-zinc-400 tracking-tighter truncate w-full text-center">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mt-3 pt-1">
            <span>14 days ago</span>
            <span className="font-mono text-zinc-600 font-semibold">
              Peak: {maxDailyBids} bids/day
            </span>
            <span>Today</span>
          </div>
        </div>

        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col">
          <h2 className="text-base font-bold text-zinc-950 tracking-tight">
            Category Performance
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5 mb-6">
            Listing density and bid attraction by category
          </p>

          {categoryBreakdown.length === 0 ? (
            <div className="my-auto text-center py-8 text-zinc-400 text-xs">
              No category data recorded yet
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {categoryBreakdown.map((item) => {
                const percent = Math.min(
                  100,
                  Math.round((item.bidsReceived / (totalBidsReceived || 1)) * 100)
                );
                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-800">{item.category}</span>
                      <span className="font-mono text-zinc-500">
                        {item.lotCount} lot{item.lotCount > 1 ? "s" : ""} &bull; {item.bidsReceived} bids ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Live Bidding Activity Feed */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h2 className="text-base font-bold text-zinc-950 tracking-tight">
              Live Bidding Activity on Your Lots
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            Latest {recentBiddingActivity.length} Events
          </span>
        </div>

        {recentBiddingActivity.length === 0 ? (
          <div className="py-10 text-center text-zinc-400 text-xs flex flex-col items-center">
            <Inbox className="h-8 w-8 text-zinc-300 mb-2" />
            <span>No incoming bids recorded on your catalogued items yet.</span>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {recentBiddingActivity.map((bid) => (
              <div
                key={bid.id}
                className="py-3.5 flex items-center justify-between text-xs hover:bg-zinc-50/70 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-700 font-mono text-[11px] shrink-0">
                    {bid.bidderName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">
                      {bid.bidderName}{" "}
                      <span className="font-normal text-zinc-500">placed bid on</span>{" "}
                      <Link
                        href={`/auctions/${bid.auctionId}`}
                        className="font-medium text-zinc-950 hover:underline hover:text-indigo-600 truncate inline-block max-w-xs align-bottom"
                      >
                        {bid.auctionTitle}
                      </Link>
                    </p>
                    <p className="text-[11px] font-mono text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(bid.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono font-bold text-sm text-zinc-950">
                  {formatPrice(bid.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lot-by-Lot Comprehensive Valuation Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-2xs">
        <div className="p-6 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-zinc-950 tracking-tight">
              Catalogue Performance Directory
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Granular status, bids, reserves, and closing timeline per lot
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-zinc-300 rounded-lg px-2.5 py-1.5 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium"
            >
              <option value="all">All Categories</option>
              {categoryBreakdown.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category} ({c.lotCount})
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No matching auction lots found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-400 font-mono uppercase tracking-wider text-[10px] border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Lot Information</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Starting Reserve</th>
                  <th className="py-3 px-4 text-right">Current / Top Bid</th>
                  <th className="py-3 px-4 text-center">Bids</th>
                  <th className="py-3 px-4 text-center">Watchlist</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {filteredListings.map((lot) => (
                  <tr key={lot.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                          <ImageWithFallback
                            src={lot.image}
                            alt={lot.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-zinc-950 truncate">{lot.title}</p>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                            {lot.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={lot.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium whitespace-nowrap text-zinc-500">
                      {formatPrice(lot.startingPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap text-zinc-950">
                      {formatPrice(lot.highestBid)}
                      {lot.highestBidder && (
                        <p className="text-[10px] font-sans font-normal text-zinc-400">
                          by {lot.highestBidder}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      {lot.bidCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-500">
                      {lot.watchlistCount}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] font-mono text-zinc-500 whitespace-nowrap">
                      {new Date(lot.endTime).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/auctions/${lot.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-indigo-600 transition-colors"
                      >
                        <span>View</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
