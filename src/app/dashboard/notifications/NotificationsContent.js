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
  ArrowRight,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/notification-actions";
import { timeAgo } from "@/lib/utils";

const typeStyles = {
  OUTBID: { icon: Gavel, className: "bg-amber-50 text-amber-600" },
  AUCTION_WON: { icon: Trophy, className: "bg-green-50 text-green-600" },
  AUCTION_ENDED: { icon: Flag, className: "bg-blue-50 text-blue-600" },
};

function NotificationItem({ notification, onMarkRead }) {
  const styles = typeStyles[notification.type] || {
    icon: Bell,
    className: "bg-indigo-50 text-indigo-600",
  };
  const Icon = styles.icon;

  const inner = (
    <>
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${styles.className}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm ${
              notification.isRead
                ? "text-gray-600"
                : "text-gray-900 font-medium"
            }`}
          >
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {timeAgo(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shrink-0 mt-1.5" />
        )}
      </div>
      {notification.href && (
        <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 mt-2">
          View auction <ArrowRight className="h-3 w-3" />
        </span>
      )}
    </>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-200 transition-colors">
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
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
            title="Mark as read"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unread > 0
              ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No notifications yet"
          description="Bid updates and auction results will appear here."
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