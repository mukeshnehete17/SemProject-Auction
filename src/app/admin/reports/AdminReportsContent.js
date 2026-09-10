"use client";

import { Package, Gavel, Users, TrendingUp, BarChart3, Star, Target } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminReportsContent({ reports }) {
  const summary = [
    {
      title: "Total Auctions",
      value: reports.totalAuctions.toLocaleString("en-IN"),
      icon: Package,
      color: "indigo",
    },
    {
      title: "Total Bids",
      value: reports.totalBids.toLocaleString("en-IN"),
      icon: Gavel,
      color: "blue",
    },
    {
      title: "Registered Users",
      value: reports.totalUsers.toLocaleString("en-IN"),
      icon: Users,
      color: "green",
    },
    {
      title: "Total Listings Value",
      value: reports.totalListingsValue
        ? formatPrice(reports.totalListingsValue)
        : "—",
      icon: TrendingUp,
      color: "amber",
    },
  ];

  const auctionStats = [
    { label: "Active", count: reports.auctionStatus.active },
    { label: "Ending Soon", count: reports.auctionStatus.endingSoon },
    { label: "Upcoming", count: reports.auctionStatus.upcoming },
    { label: "Ended", count: reports.auctionStatus.ended },
    { label: "Cancelled", count: reports.auctionStatus.cancelled },
  ];

  const maxCategory = Math.max(
    ...reports.topCategories.map((row) => row.count),
    1
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time statistics and insights from the database
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {summary.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  stat.color === "indigo"
                    ? "bg-indigo-50 text-indigo-600"
                    : stat.color === "blue"
                    ? "bg-blue-50 text-blue-600"
                    : stat.color === "green"
                    ? "bg-green-50 text-green-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900 truncate">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Auction Status Breakdown
            </h2>
          </div>
          <ul className="divide-y divide-gray-100 p-2">
            {auctionStats.map((row) => (
              <li key={row.label} className="flex items-center justify-between px-3 py-4">
                <span className="text-sm text-gray-700">{row.label}</span>
                <span className="text-sm font-semibold text-gray-900">{row.count}</span>
              </li>
            ))}
          </ul>
          <div className="px-5 pb-5">
            <dt className="text-xs font-medium text-gray-500 uppercase">
              Average Bid Amount
            </dt>
            <dd className="mt-1 text-lg font-bold text-gray-900">
              {reports.avgBid ? formatPrice(Math.round(reports.avgBid)) : "—"}
            </dd>
            <dt className="text-xs font-medium text-gray-500 uppercase mt-4">
              Highest Bid Placed
            </dt>
            <dd className="mt-1 text-lg font-bold text-gray-900">
              {reports.highestBid ? formatPrice(reports.highestBid) : "—"}
            </dd>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Auctions by Category
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {reports.topCategories.length === 0 && (
              <p className="text-sm text-gray-500">No categories yet.</p>
            )}
            {reports.topCategories.map((row) => (
              <div key={row.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{row.name}</span>
                  <span className="font-semibold text-gray-900">{row.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${Math.max(4, (row.count / maxCategory) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <Star className="h-4 w-4 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">Top Sellers</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {reports.topSellers.length === 0 && (
              <li className="px-5 py-6 text-sm text-gray-500">No auctions yet.</li>
            )}
            {reports.topSellers.map((row, index) => (
              <li key={row.name} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-sm font-semibold text-gray-400">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{row.name}</span>
                </div>
                <span className="text-sm text-gray-700">{row.count} auctions</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <Gavel className="h-4 w-4 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">Most Active Bidders</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {reports.topBidders.length === 0 && (
              <li className="px-5 py-6 text-sm text-gray-500">No bids yet.</li>
            )}
            {reports.topBidders.map((row, index) => (
              <li key={row.name} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-sm font-semibold text-gray-400">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{row.name}</span>
                </div>
                <span className="text-sm text-gray-700">{row.count} bids</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}