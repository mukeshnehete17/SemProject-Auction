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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Platform overview and management</p>
      </div>

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

      <div className="flex flex-wrap items-center gap-3 mt-6">
        {statusSummary.map((item) => (
          <div
            key={item.mini}
            className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-200 px-4 py-2.5 hover:shadow-sm transition-shadow duration-200"
          >
            <StatusBadge status={item.mini} />
            <span className="text-sm font-bold text-gray-900">
              {item.count}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Auctions</h2>
            <Link
              href="/admin/auctions"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View All
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Bid</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bids</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentAuctions.map((auction) => (
                  <tr key={auction.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      <Link href={`/auctions/${auction.id}`} className="hover:text-indigo-600 transition-colors">
                        {auction.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap font-medium">
                      {formatPrice(auction.currentPrice)}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {auction.numberOfBids}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <StatusBadge status={auction.status} />
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDateTime(auction.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Users</h2>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View All
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{user.email}</td>
                    <td className="px-5 py-3 text-sm capitalize text-gray-700 whitespace-nowrap font-medium">
                      {user.role.toLowerCase()}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
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