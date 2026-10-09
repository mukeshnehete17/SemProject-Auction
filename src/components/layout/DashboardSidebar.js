"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Gavel,
  Package,
  Trophy,
  Heart,
  User,
  LogOut,
  Users,
  Flag,
  Home,
  X,
  PlusCircle,
  Bell,
  Layers,
} from "lucide-react";

const buyerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-bids", label: "My Bids", icon: Gavel },
  { href: "/dashboard/won-auctions", label: "Won Auctions", icon: Trophy },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const sellerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-auctions", label: "My Auctions", icon: Package },
  { href: "/dashboard/create-auction", label: "Create Auction", icon: PlusCircle },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/auctions", label: "Auctions", icon: Package },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/", label: "Storefront", icon: Home },
];

function SidebarContent({ role, pathname, onNavigate }) {
  const links = role === "admin" ? adminLinks : role === "seller" ? sellerLinks : buyerLinks;

  const handleLogout = async () => {
    if (onNavigate) onNavigate();
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-200/80">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-[-0.05em] text-zinc-950 group-hover:text-indigo-600 transition-colors">
            TORI
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 mb-2" />
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold px-2 py-0.5 rounded-full bg-zinc-100">
          {role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-2">
          Workspace
        </p>
        {links.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 ${
                isActive
                  ? "bg-zinc-950 text-white shadow-xs font-semibold"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              <link.icon
                className={`h-4 w-4 shrink-0 ${isActive ? "text-indigo-400" : "text-zinc-400"}`}
              />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer sign out */}
      <div className="p-4 border-t border-zinc-200/80">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-xs font-medium text-zinc-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0 text-zinc-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardSidebar({ role = "user", isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-zinc-200/80 z-40">
        <SidebarContent role={role} pathname={pathname} onNavigate={onClose} />
      </aside>

      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs"
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-4 p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 transition-colors z-10"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
          <SidebarContent role={role} pathname={pathname} onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
}
