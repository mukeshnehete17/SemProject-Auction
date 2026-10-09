"use client";

import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import { formatPrice, timeAgo } from "@/lib/utils";
import {
  Activity,
  Gavel,
  Package,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Trophy,
  Heart,
  Bell,
  BellRing,
  PlusCircle,
} from "lucide-react";

const buyerQuickActions = [
  {
    title: "Browse Live Auctions",
    description: "Discover verified lots undergoing active bidding",
    href: "/auctions",
    icon: Gavel,
  },
  {
    title: "Review Watchlist",
    description: "Monitor lots you have saved for tracking",
    href: "/dashboard/watchlist",
    icon: Heart,
  },
  {
    title: "Won Auctions",
    description: "Review lots won and fulfillment progress",
    href: "/dashboard/won-auctions",
    icon: Trophy,
  },
];

const sellerQuickActions = [
  {
    title: "Consign New Lot",
    description: "Create and publish an authenticated auction listing",
    href: "/dashboard/create-auction",
    icon: PlusCircle,
  },
  {
    title: "Manage Listings",
    description: "Review your active, upcoming, and closed lots",
    href: "/dashboard/my-auctions",
    icon: Package,
  },
  {
    title: "Marketplace Directory",
    description: "Inspect active competing lots in all departments",
    href: "/auctions",
    icon: Gavel,
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
        { title: "Consigned Lots", value: auctionsCreated, icon: Package, color: "indigo" },
        { title: "Active Listings", value: activeListings, icon: TrendingUp, color: "green" },
        { title: "Completed Lots", value: completedAuctions, icon: Trophy, color: "amber" },
        { title: "Unread Alerts", value: unreadCount, icon: Bell, color: "red" },
      ]
    : [
        { title: "Active Bids", value: activeBids, icon: Gavel, color: "indigo" },
        { title: "Auctions Won", value: wonAuctions, icon: Trophy, color: "amber" },
        { title: "Watchlist Items", value: watchlistCount, icon: Heart, color: "red" },
        { title: "Unread Alerts", value: unreadCount, icon: Bell, color: "blue" },
      ];

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="border-b border-zinc-200/80 pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
          Overview Dashboard
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
          Welcome back, {userName.split(" ")[0]}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Live summary of your {isSeller ? "consignments and seller activity" : "bidding ledger and watchlist"}.
        </p>
      </div>

      {/* Metrics Row */}
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

      {/* Main Content Split: Recent Activity + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Activity Box */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              {isSeller ? "Recent Consignment Bids" : "Recent Bidding Ledger"}
            </h2>
            <Link
              href={isSeller ? "/dashboard/my-auctions" : "/dashboard/my-bids"}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-2">
            {recentBids.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Activity className="h-8 w-8 text-zinc-300 mb-2" />
                <p className="text-xs text-zinc-500">
                  No recorded activity yet. Place a bid or create an auction to activate your ledger.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {recentBids.map((bid) => (
                  <Link
                    key={`${bid.auctionId}-${bid.createdAt}`}
                    href={`/auctions/${bid.auctionId}`}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center justify-center shrink-0 text-zinc-600">
                      <Gavel className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                        {bid.title}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        Bid of {formatPrice(bid.amount)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-mono font-bold text-zinc-950">
                        {formatPrice(bid.amount)}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 justify-end mt-0.5">
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

        {/* Notifications Box */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              System Notifications
            </h2>
            <Link
              href="/dashboard/notifications"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-2">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <BellRing className="h-8 w-8 text-zinc-300 mb-2" />
                <p className="text-xs text-zinc-500">
                  {unreadCount === 0
                    ? "All clear. Outbid notifications and winning notices will appear here."
                    : "No notifications."}
                </p>
              </div>
            ) : (
              <>
                {unreadCount > 0 && (
                  <div className="px-4 py-2 bg-indigo-50/50 text-[11px] font-mono font-semibold text-indigo-700 rounded-lg mx-2 my-1">
                    {unreadCount} unread system notice{unreadCount === 1 ? "" : "s"}
                  </div>
                )}
                <div className="divide-y divide-zinc-100">
                  {recentNotifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href || "/dashboard/notifications"}
                      className="flex items-start gap-3.5 px-4 py-3.5 rounded-xl hover:bg-zinc-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center shrink-0 text-zinc-600 mt-0.5">
                        <Bell className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs sm:text-sm leading-relaxed ${
                            n.isRead ? "text-zinc-600" : "text-zinc-950 font-bold"
                          }`}
                        >
                          {n.message}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-400 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 mt-2" />
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4">
          Direct Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="bg-white p-5 rounded-2xl border border-zinc-200/90 hover:border-zinc-300 hover:shadow-xs transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-sm text-zinc-950 mb-1 tracking-tight">
                  {action.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}