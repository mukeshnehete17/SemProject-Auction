"use client";

import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatPrice, formatDateTime } from "@/lib/utils";
import {
  Users,
  Package,
  TrendingUp,
  Gavel,
  Clock,
  Flag,
  ArrowUpRight,
  User,
} from "lucide-react";

export default function AdminOverviewContent({ stats, recentAuctions, recentUsers }) {
  const statusSummary = [
    { label: "Active", count: stats.auctionStatus.active, mini: "active" },
    { label: "Ending Soon", count: stats.auctionStatus.endingSoon, mini: "ending_soon" },
    { label: "Upcoming", count: stats.auctionStatus.upcoming, mini: "upcoming" },
    { label: "Ended", count: stats.auctionStatus.ended, mini: "ended" },
    { label: "Cancelled", count: stats.auctionStatus.cancelled, mini: "cancelled" },
  ];

  const statCards = [
    { title: "Total Users", value: stats.totalUsers.toLocaleString("en-IN"), icon: Users, color: "indigo" },
    { title: "Total Auctions", value: stats.totalAuctions.toLocaleString("en-IN"), icon: Package, color: "blue" },
    { title: "Active Auctions", value: stats.auctionStatus.active.toLocaleString("en-IN"), icon: TrendingUp, color: "green" },
    { title: "Ending Soon", value: stats.auctionStatus.endingSoon.toLocaleString("en-IN"), icon: Clock, color: "amber" },
    { title: "Total Bids", value: stats.totalBids.toLocaleString("en-IN"), icon: Gavel, color: "indigo" },
    { title: "Ended Auctions", value: stats.auctionStatus.ended.toLocaleString("en-IN"), icon: Flag, color: "red" },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-zinc-200/80 pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
          Platform Oversight
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
          Administrative Command
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Real-time platform metrics, user registry distribution, and auction status tallies.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Status Distribution Pills */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold mb-3">
          Lifecycle Breakdown
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {statusSummary.map((item) => (
            <div
              key={item.mini}
              className="flex items-center gap-3 bg-white rounded-xl border border-zinc-200/90 px-4 py-2.5 shadow-2xs"
            >
              <StatusBadge status={item.mini} />
              <span className="text-sm font-mono font-bold text-zinc-950">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tables Row: Recent Auctions & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Auctions */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Recent Auction Additions
            </h2>
            <Link
              href="/admin/auctions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="px-5 py-3">Lot Title</th>
                  <th className="px-4 py-3">Valuation</th>
                  <th className="px-4 py-3">Bids</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {recentAuctions.map((auction) => (
                  <tr key={auction.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-zinc-950 whitespace-nowrap max-w-[180px] truncate">
                      <Link href={`/auctions/${auction.id}`} className="hover:text-indigo-600 transition-colors">
                        {auction.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-950 whitespace-nowrap">
                      {formatPrice(auction.currentPrice)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-600 whitespace-nowrap">
                      {auction.numberOfBids}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={auction.status} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-zinc-400 text-[11px] whitespace-nowrap text-right">
                      {formatDateTime(auction.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Recent Member Registrations
            </h2>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="px-5 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Clearance</th>
                  <th className="px-5 py-3 text-right">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-zinc-950 text-white flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="font-bold text-zinc-950">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500 whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {user.role.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-zinc-400 text-[11px] whitespace-nowrap text-right">
                      {formatDateTime(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}