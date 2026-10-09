"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export default function NotificationBell() {
  const { status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [recent, setRecent] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/notifications/unread", {
          cache: "no-store",
        });
        const data = await res.json();
        if (!active) return;
        setCount(data.count || 0);
        setRecent(data.recent || []);
      } catch {
        // ignore refetch failures
      }
    })();
    return () => {
      active = false;
    };
  }, [status, pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (status !== "authenticated") return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
        aria-label="View notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {count > 0 && (
          <span className="absolute 1 top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Notifications
            </p>
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="px-4 py-8 text-xs text-center text-zinc-400">
              No recent notifications
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
              {recent.map((n) => (
                <Link
                  key={n.id}
                  href={n.href || "/dashboard/notifications"}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-zinc-50 transition-colors"
                >
                  <p
                    className={`text-xs leading-relaxed ${
                      n.isRead ? "text-zinc-600" : "text-zinc-950 font-semibold"
                    }`}
                  >
                    {n.message}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-1">
                    {timeAgo(n.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}