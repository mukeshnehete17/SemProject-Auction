"use client";

import { useRef } from "react";
import Button from "@/components/ui/Button";
import HeroAuction from "@/components/auction/HeroAuction";
import { useGsapHero } from "@/lib/animations";
import { Package, Gavel, Users, ArrowUpRight } from "lucide-react";

export default function HomeHero({ heroAuction, stats }) {
  const containerRef = useRef(null);
  useGsapHero(containerRef);

  return (
    <section
      ref={containerRef}
      className="relative bg-zinc-950 text-white overflow-hidden border-b border-zinc-900 min-h-[calc(100svh-42px)] lg:min-h-[calc(100vh-100px)] flex flex-col justify-center"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Headline & CTAs (Left Column - 7 Cols) */}
          <div className="lg:col-span-7 space-y-7">
            <div data-hero-sub className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-full px-3.5 py-1.5 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                The Contemporary Auction House
              </span>
            </div>

            <div data-hero-title className="space-y-1">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[5.2rem] font-bold tracking-[-0.04em] leading-[0.93] text-white">
                Bid. Compete.
                <br />
                <span className="text-zinc-400 font-medium">Win the Rare.</span>
              </h1>
            </div>

            <p
              data-hero-desc
              className="text-sm sm:text-base text-zinc-400 max-w-lg leading-relaxed font-normal"
            >
              Discover certified electronics, horology, collectibles, and rare computing machinery. Participate in transparent, second-by-second competitive bidding.
            </p>

            <div data-hero-actions className="flex flex-wrap items-center gap-3 pt-1">
              <Button href="/auctions" variant="accent" size="lg" className="group">
                <span>Explore Live Auctions</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
              <Button
                href="/register"
                variant="outline"
                size="lg"
                className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 hover:border-zinc-700"
              >
                Start Selling
              </Button>
            </div>

            {/* Live Metrics Strip */}
            <div
              data-hero-meta
              className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-900 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] uppercase">
                  <Package className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Auctions</span>
                </div>
                <p className="text-lg sm:text-xl font-bold font-mono text-white">
                  {stats.auctionCount}
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] uppercase">
                  <Gavel className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Bids Placed</span>
                </div>
                <p className="text-lg sm:text-xl font-bold font-mono text-white">
                  {stats.bidCount}
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] uppercase">
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Collectors</span>
                </div>
                <p className="text-lg sm:text-xl font-bold font-mono text-white">
                  {stats.userCount}
                </p>
              </div>
            </div>
          </div>

          {/* Featured Hero Auction Showcase (Right Column - 5 Cols) */}
          <div data-hero-card className="lg:col-span-5 flex justify-center lg:justify-end">
            {heroAuction ? (
              <div className="w-full max-w-md">
                <HeroAuction auction={heroAuction} />
              </div>
            ) : (
              <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                  <Gavel className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-300">
                  No Active Lots Currently Live
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  New auction lots are catalogued daily. Check back shortly or browse upcoming drops.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
