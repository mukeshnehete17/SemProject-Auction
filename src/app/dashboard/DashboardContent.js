"use client";

import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import { formatPrice, timeAgo } from "@/lib/utils";
import {
  Activity,
  Gavel,
  Package,
  Clock,
  ArrowRight,
  TrendingUp,
  Trophy,
  Heart,
  Bell,
  BellRing,
} from "lucide-react";

const buyerQuickActions = [
  {
    title: "Browse Auctions",
    description: "Discover amazing products up for auction",
    href: "/auctions",
    color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
  },
  {
    title: "View Watchlist",
    description: "Keep track of auctions you're interested in",
    href: "/dashboard/watchlist",
    color: "bg-red-50 text-red-600 hover:bg-red-100",
  },
  {
    title: "Won Auctions",
    description: "View your winning bids",
    href: "/dashboard/won-auctions",
    color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  },
];

const sellerQuickActions = [
  {
    title: "Browse Auctions",
    description: "Discover amazing products up for auction",
    href: "/auctions",
    color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
  },
  {
    title: "Create Auction",
    description: "List your product and start selling",
    href: "/dashboard/create-auction",
    color: "bg-green-50 text-green-600 hover:bg-green-100",
  },
  {
    title: "View Watchlist",
    description: "Keep track of auctions you're interested in",
    href: "/dashboard/watchlist",
    color: "bg-red-50 text-red-600 hover:bg-red-100",
  },
];

export default function DashboardContent({
  userName,
  role,
  bidsPlaced,
  activeBids,
  wonAuctions,
  watchlistCount,
  unreadCount,
  recentNotifications,
  auctionsCreated,
  activeListings,
  completedAuctions,
  recentBids,
}) {
  const isSeller = role === "SELLER" || role === "ADMIN";
  const quickActions = isSeller ? sellerQuickActions : buyerQuickActions;

  const statCards = isSeller
    ? [
        { title: "My Auctions", value: auctionsCreated, icon: Package, color: "indigo" },
        { title: "Active Auctions", value: activeListings, icon: TrendingUp, color: "green" },
        { title: "Completed Auctions", value: completedAuctions, icon: Trophy, color: "amber" },
        { title: "Unread Notifications", value: unreadCount, icon: Bell, color: "red" },
      ]
    : [
        { title: "Active Bids", value: activeBids, icon: Gavel, color: "indigo" },
        { title: "Auctions Won", value: wonAuctions, icon: Trophy, color: "amber" },
        { title: "Watchlist Items", value: watchlistCount, icon: Heart, color: "red" },
        { title: "Unread Notifications", value: unreadCount, icon: Bell, color: "blue" },
      ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userName.split(" ")[0]}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening{isSeller ? " with your auctions" : " with your bids"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              {isSeller ? "Recent Bids" : "Recent Activity"}
            </h2>
            <Link
              href={isSeller ? "/dashboard/my-auctions" : "/dashboard/my-bids"}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-2">
            {recentBids.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Activity className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">
                  No activity yet. Place a bid or create your first auction to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentBids.map((bid) => (
                  <Link
                    key={`${bid.auctionId}-${bid.createdAt}`}
                    href={`/auctions/${bid.auctionId}`}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Gavel className="h-4.5 w-4.5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {bid.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Bid of {formatPrice(bid.amount)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(bid.amount)}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                        <Clock className="h-3 w-3" />
                        {timeAgo(bid.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
            <Link
              href="/dashboard/notifications"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-2">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BellRing className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">
                  {unreadCount === 0
                    ? "No notifications yet. Bid updates will appear here."
                    : "No notifications."}
                </p>
              </div>
            ) : (
              <>
                {unreadCount > 0 && (
                  <p className="text-xs font-medium text-red-600 px-4 pt-3 pb-1">
                    You have {unreadCount} unread notification
                    {unreadCount === 1 ? "" : "s"}.
                  </p>
                )}
                <div className="divide-y divide-gray-50">
                  {recentNotifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href || "/dashboard/notifications"}
                      className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <BellRing className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${
                            n.isRead ? "text-gray-600" : "text-gray-900 font-medium"
                          }`}
                        >
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-2" />
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`p-5 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${action.color}`}
            >
              <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
              <p className="text-xs opacity-75">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}