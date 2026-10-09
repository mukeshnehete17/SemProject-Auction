"use client";

import { useRef } from "react";
import Button from "@/components/ui/Button";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useGsapScrollReveal } from "@/lib/animations";

export default function HomeCta() {
  const containerRef = useRef(null);
  useGsapScrollReveal(containerRef, "[data-cta-content]");

  return (
    <section ref={containerRef} className="py-24 sm:py-28 bg-white border-b border-zinc-200 text-center relative overflow-hidden">
      <div data-cta-content className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-mono uppercase tracking-widest text-indigo-600 font-semibold">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Join The Auction Room</span>
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 leading-tight">
          Ready to place your inaugural bid?
        </h2>
        <p className="text-sm sm:text-base text-zinc-500 max-w-lg mx-auto leading-relaxed">
          Register to participate in live, certified drops or create an authorized seller profile to consign items.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Button href="/auctions" variant="primary" size="lg" className="group shadow-sm">
            <span>Explore Active Lots</span>
            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
          <Button href="/register" variant="outline" size="lg">
            Create Free Account
          </Button>
        </div>
      </div>
    </section>
  );
}
