"use client";

import { useRef } from "react";
import AuctionCard from "@/components/auction/AuctionCard";
import Button from "@/components/ui/Button";
import { ArrowUpRight, Flame } from "lucide-react";
import { useGsapStagger } from "@/lib/animations";

export default function HomeFeatured({ auctions }) {
  const gridRef = useRef(null);
  useGsapStagger(gridRef, "[data-auction-item]");

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 pb-6 border-b border-zinc-200">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-indigo-600 mb-2 font-semibold">
              <Flame className="h-3.5 w-3.5" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
              Featured Auction Lots
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              High-interest inventory undergoing active bidding windows.
            </p>
          </div>

          <Button href="/auctions" variant="outline" size="md" className="hidden sm:inline-flex group">
            <span>Explore All Lots</span>
            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </div>

        {/* Auctions Grid */}
        {auctions.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl text-zinc-500">
            <p className="text-sm font-medium">No featured auctions available at this moment.</p>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {auctions.map((auction) => (
              <div key={auction.id} data-auction-item>
                <AuctionCard auction={auction} />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Button href="/auctions" variant="primary" size="md" className="w-full">
            <span>View All Auctions</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
