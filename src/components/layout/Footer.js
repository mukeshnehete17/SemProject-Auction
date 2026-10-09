import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="text-2xl font-black tracking-[-0.05em] text-white">
                TORI
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            </Link>
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
              The Contemporary Auction Marketplace
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Engineered for transparent price discovery, zero-latency bidding, and certified provenance. Built with Next.js, Prisma, and Tailwind CSS.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest">
              Marketplace
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/auctions" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Active Lots
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Bidding Protocol
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  The Editorial
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest">
              Account
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/register" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/watchlist" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Saved Lots
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest">
              Information
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Provenance & Trust
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Rules of Engagement
                </Link>
              </li>
              <li>
                <a
                  href="#top"
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors pt-2"
                >
                  <span>Back to top</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-900 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© 2026 TORI Online Auction Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-[11px] font-mono text-zinc-500">v1.0 · PHASE 1 EDITORIAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
