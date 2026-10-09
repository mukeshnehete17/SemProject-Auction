"use client";

import { Package, Gavel, Users, TrendingUp, BarChart3, Star, Target, ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminReportsContent({ reports }) {
  const summary = [
    {
      title: "Active Catalogue Lots",
      value: reports.totalAuctions.toLocaleString("en-IN"),
      meta: "Global Listings Count",
      icon: Package,
    },
    {
      title: "Total Offers Logged",
      value: reports.totalBids.toLocaleString("en-IN"),
      meta: "All-time recorded bids",
      icon: Gavel,
    },
    {
      title: "Verified Members",
      value: reports.totalUsers.toLocaleString("en-IN"),
      meta: "Platform participants",
      icon: Users,
    },
    {
      title: "Gross Market Valuation",
      value: reports.totalListingsValue
        ? formatPrice(reports.totalListingsValue)
        : "—",
      meta: "Aggregate listing volume",
      icon: TrendingUp,
    },
  ];

  const auctionStats = [
    { label: "Active", count: reports.auctionStatus.active, color: "bg-emerald-500" },
    { label: "Ending Soon", count: reports.auctionStatus.endingSoon, color: "bg-amber-500" },
    { label: "Upcoming", count: reports.auctionStatus.upcoming, color: "bg-[#7c3aed]" },
    { label: "Closed / Ended", count: reports.auctionStatus.ended, color: "bg-[#888888]" },
    { label: "Cancelled", count: reports.auctionStatus.cancelled, color: "bg-rose-500" },
  ];

  const totalStatusCount = Object.values(reports.auctionStatus).reduce((a, b) => a + b, 0) || 1;

  const maxCategory = Math.max(
    ...reports.topCategories.map((row) => row.count),
    1
  );

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b hairline-border">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#7c3aed] block mb-2">
            Intelligence & Auditing
          </span>
          <h1 className="editorial-display text-3xl sm:text-4xl text-[#0d0d0d]">
            Platform Analytics
          </h1>
          <p className="editorial-sub text-sm sm:text-base text-[#666666] mt-2 max-w-xl">
            Real-time market velocity, liquidity indicators, and auction participation metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full border hairline-border bg-white text-xs font-mono text-[#444444] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live DB Telemetry
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl border hairline-border p-6 relative overflow-hidden group hover:border-[#0d0d0d]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#7c3aed]">
                {stat.title}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#fafafc] border hairline-border flex items-center justify-center text-[#666666] group-hover:text-[#7c3aed] transition-colors">
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="editorial-display text-3xl text-[#0d0d0d] tracking-tight">
              {stat.value}
            </div>
            <p className="text-xs text-[#888888] mt-2 font-mono">
              {stat.meta}
            </p>
          </div>
        ))}
      </div>

      {/* Row 2: Status Breakdown & Category Volumes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border hairline-border overflow-hidden">
          <div className="px-6 py-5 border-b hairline-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-4 w-4 text-[#7c3aed]" />
              <h2 className="editorial-display text-lg text-[#0d0d0d]">
                Auction Lifecycle Distribution
              </h2>
            </div>
            <span className="font-mono text-xs text-[#888888]">
              {reports.totalAuctions} total lots
            </span>
          </div>
          <div className="p-6 space-y-4">
            {auctionStats.map((row) => {
              const pct = Math.round((row.count / totalStatusCount) * 100);
              return (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#222222]">{row.label}</span>
                    <span className="font-mono text-[#666666]">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#f2f2f4] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t hairline-border">
              <div className="p-4 rounded-xl bg-[#fafafc] border hairline-border">
                <dt className="font-mono text-[10px] uppercase text-[#888888]">
                  Mean Offer Size
                </dt>
                <dd className="font-mono text-xl font-semibold text-[#0d0d0d] mt-1">
                  {reports.avgBid ? formatPrice(Math.round(reports.avgBid)) : "—"}
                </dd>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafc] border hairline-border">
                <dt className="font-mono text-[10px] uppercase text-[#888888]">
                  Record Single Bid
                </dt>
                <dd className="font-mono text-xl font-semibold text-[#7c3aed] mt-1">
                  {reports.highestBid ? formatPrice(reports.highestBid) : "—"}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border hairline-border overflow-hidden">
          <div className="px-6 py-5 border-b hairline-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Target className="h-4 w-4 text-[#7c3aed]" />
              <h2 className="editorial-display text-lg text-[#0d0d0d]">
                Distribution by Category
              </h2>
            </div>
            <span className="font-mono text-xs text-[#888888]">
              {reports.topCategories.length} categories
            </span>
          </div>
          <div className="p-6 space-y-4">
            {reports.topCategories.length === 0 ? (
              <p className="text-sm text-[#888888] font-mono">No category data recorded.</p>
            ) : (
              reports.topCategories.map((row) => (
                <div key={row.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#222222]">{row.name}</span>
                    <span className="font-mono text-[#7c3aed] font-semibold">
                      {row.count} lots
                    </span>
                  </div>
                  <div className="w-full bg-[#f2f2f4] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#0d0d0d] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, (row.count / maxCategory) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Consignors */}
        <div className="bg-white rounded-2xl border hairline-border overflow-hidden">
          <div className="px-6 py-5 border-b hairline-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Star className="h-4 w-4 text-[#7c3aed]" />
              <h2 className="editorial-display text-lg text-[#0d0d0d]">
                Top Consignors
              </h2>
            </div>
            <span className="font-mono text-xs text-[#888888]">By listings</span>
          </div>
          <ul className="divide-y hairline-border">
            {reports.topSellers.length === 0 ? (
              <li className="px-6 py-8 text-sm text-[#888888] font-mono text-center">
                No consignor records available.
              </li>
            ) : (
              reports.topSellers.map((row, index) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#fafafc] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="font-mono text-xs text-[#888888] w-6">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-[#0d0d0d]">
                      {row.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#f5f5f7] border hairline-border text-[#444444]">
                    {row.count} lots
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Most Active Bidders */}
        <div className="bg-white rounded-2xl border hairline-border overflow-hidden">
          <div className="px-6 py-5 border-b hairline-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Gavel className="h-4 w-4 text-[#7c3aed]" />
              <h2 className="editorial-display text-lg text-[#0d0d0d]">
                Most Active Participants
              </h2>
            </div>
            <span className="font-mono text-xs text-[#888888]">By bid velocity</span>
          </div>
          <ul className="divide-y hairline-border">
            {reports.topBidders.length === 0 ? (
              <li className="px-6 py-8 text-sm text-[#888888] font-mono text-center">
                No active bids recorded.
              </li>
            ) : (
              reports.topBidders.map((row, index) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#fafafc] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="font-mono text-xs text-[#888888] w-6">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium text-[#0d0d0d]">
                      {row.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-medium border border-[#7c3aed]/20">
                    {row.count} offers
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}