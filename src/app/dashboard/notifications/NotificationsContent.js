"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  BellRing,
  Trophy,
  Flag,
  Gavel,
  CheckCheck,
  ArrowUpRight,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/notification-actions";
import { timeAgo } from "@/lib/utils";

const typeStyles = {
  OUTBID: { icon: Gavel, className: "bg-rose-50 text-rose-600 border-rose-100" },
  AUCTION_WON: { icon: Trophy, className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  AUCTION_ENDED: { icon: Flag, className: "bg-zinc-100 text-zinc-600 border-zinc-200" },
};

function NotificationItem({ notification, onMarkRead }) {
  const styles = typeStyles[notification.type] || {
    icon: Bell,
    className: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };
  const Icon = styles.icon;

  const inner = (
    <div className="flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${styles.className}`}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs sm:text-sm leading-relaxed ${
            notification.isRead
              ? "text-zinc-600"
              : "text-zinc-950 font-bold"
          }`}
        >
          {notification.message}
        </p>
        <p className="text-[10px] font-mono text-zinc-400 mt-1">
          {timeAgo(notification.createdAt)}
        </p>
        {notification.href && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-2">
            <span>Enter Auction Room</span>
            <ArrowUpRight className="h-3 w-3" />
          </span>
        )}
      </div>
      {!notification.isRead && (
        <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 mt-2" />
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 hover:border-zinc-300 transition-all shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {notification.href ? (
            <Link href={notification.href} className="block">
              {inner}
            </Link>
          ) : (
            inner
          )}
        </div>
        {!notification.isRead && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="p-2 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0 cursor-pointer"
            title="Mark as read"
            aria-label="Mark notification as read"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function NotificationsContent({ notifications, unreadCount }) {
  const router = useRouter();
  const [list, setList] = useState(notifications);

  const handleMarkRead = async (id) => {
    await markNotificationReadAction(id);
    setList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    router.refresh();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction();
    setList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    router.refresh();
  };

  const unread = list.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
            System Communications
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {unread > 0
              ? `You have ${unread} unread notice${unread === 1 ? "" : "s"} requiring review.`
              : "All system notices have been marked as acknowledged."}
          </p>
        </div>

        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No System Notifications"
          description="Real-time notifications regarding outbid events, reserve closes, and lot awards will appear here."
        />
      ) : (
        <div className="space-y-3">
          {list.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}