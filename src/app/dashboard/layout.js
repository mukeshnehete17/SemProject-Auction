"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import NotificationBell from "@/components/layout/NotificationBell";

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  const name = session?.user?.name || "Collector";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const role = session?.user?.role?.toLowerCase() || "buyer";

  return (
    <div className="min-h-screen bg-zinc-50/60 flex">
      <DashboardSidebar
        role={role}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
        {/* Editorial Topbar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden sm:inline-block text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              TORI Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="h-4 w-px bg-zinc-200" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-950 text-white flex items-center justify-center text-xs font-bold font-mono shadow-2xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-zinc-950 leading-tight">
                  {name}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-medium">
                  {role} account
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="p-4 sm:p-8 lg:p-10 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
