import Link from "next/link";
import { Gavel } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Gavel className="h-5 w-5 text-indigo-400" />
              <span className="text-lg font-bold text-white">TORI</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-1">Bid. Compete. Win.</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Online auction platform built with Next.js, Prisma, and Tailwind CSS.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/auctions" className="text-xs text-gray-400 hover:text-white transition-colors">Browse Auctions</Link></li>
              <li><Link href="/how-it-works" className="text-xs text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/about" className="text-xs text-gray-400 hover:text-white transition-colors">About TORI</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Account</h3>
            <ul className="space-y-2">
              <li><Link href="/register" className="text-xs text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link href="/login" className="text-xs text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-xs text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/how-it-works" className="text-xs text-gray-400 hover:text-white transition-colors">Help & FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 mt-10 pt-6">
          <p className="text-[11px] text-gray-600 text-center">
            &copy; 2026 TORI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
