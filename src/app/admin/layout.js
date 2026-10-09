"use client";

import { useState } from "react";
import { Menu, ShieldAlert } from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import NotificationBell from "@/components/layout/NotificationBell";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  const name = session?.user?.name || "Administrator";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50/60 flex">
      <DashboardSidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
        {/* Editorial Topbar for Admin */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
                Control Console
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-mono font-bold px-2.5 py-0.5 uppercase tracking-wider">
                <ShieldAlert className="h-3 w-3" />
                Root Authority
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="h-4 w-px bg-zinc-200" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-zinc-950 leading-tight">{name}</p>
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 lg:p-10 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}