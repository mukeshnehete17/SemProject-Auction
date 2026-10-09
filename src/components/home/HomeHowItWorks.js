"use client";

import { useRef } from "react";
import { Search, Gavel, Clock, Trophy } from "lucide-react";
import { useGsapScrollReveal } from "@/lib/animations";

const steps = [
  {
    num: "01",
    icon: Search,
    title: "Discover the Drop",
    description: "Browse authenticated auctions with real-time provenance, condition reports, and reserve data.",
  },
  {
    num: "02",
    icon: Gavel,
    title: "Place Your Bid",
    description: "Enter competitive bids with zero latency and automatic outbid notifications sent immediately.",
  },
  {
    num: "03",
    icon: Clock,
    title: "Watch the Countdown",
    description: "Track the lot live with anti-sniping protection ensuring authentic competition until the hammer falls.",
  },
  {
    num: "04",
    icon: Trophy,
    title: "Secure the Win",
    description: "Highest verified bidder receives the lot with secure escrow checkout and direct fulfillment.",
  },
];

export default function HomeHowItWorks() {
  const containerRef = useRef(null);
  useGsapScrollReveal(containerRef, "[data-step-card]");

  return (
    <section ref={containerRef} className="py-20 sm:py-24 bg-zinc-950 text-white border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">
            The TORI Protocol
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            How The Marketplace Operates
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            A transparent four-phase process from catalog discovery to certified acquisition.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                data-step-card
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 sm:p-7 relative transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-mono font-bold text-zinc-700">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
