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
  Hammer,
  Bell,
} from "lucide-react";

const buyerLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/my-bids", label: "My Bids", icon: Gavel },
  { href: "/dashboard/won-auctions", label: "Won Auctions", icon: Trophy },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const sellerLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/my-auctions", label: "My Auctions", icon: Package },
  { href: "/dashboard/create-auction", label: "Create Auction", icon: Hammer },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Heart },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/auctions", label: "Auctions", icon: Package },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/", label: "Back to Home", icon: Home },
];

function SidebarContent({ role, pathname, onNavigate }) {
  const links = role === "admin" ? adminLinks : role === "seller" ? sellerLinks : buyerLinks;

  const handleLogout = async () => {
    if (onNavigate) onNavigate();
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Hammer className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-indigo-600 tracking-tight">TORI</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <link.icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? "text-indigo-600" : ""}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-150"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function DashboardSidebar({ role = "user", isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
<aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <SidebarContent role={role} pathname={pathname} onNavigate={onClose} />
      </aside>

      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent role={role} pathname={pathname} onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
}
