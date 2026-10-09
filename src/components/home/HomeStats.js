"use client";

import { useRef } from "react";
import { Users, Package, TrendingUp, Trophy } from "lucide-react";
import { useGsapScrollReveal, useCountUp } from "@/lib/animations";

function StatCounter({ value, suffix }) {
  const numRef = useRef(null);
  useCountUp(numRef, value);

  return (
    <span className="tabular-nums">
      <span ref={numRef}>{value.toLocaleString("en-IN")}</span>
      {suffix}
    </span>
  );
}

export default function HomeStats({ stats }) {
  const containerRef = useRef(null);
  useGsapScrollReveal(containerRef, "[data-stat-box]");

  const statItems = [
    { label: "Registered Collectors", value: stats.userCount, icon: Users, suffix: "" },
    { label: "Active Live Auctions", value: stats.auctionCount, icon: Package, suffix: "" },
    { label: "Total Bids Placed", value: stats.bidCount, icon: TrendingUp, suffix: "" },
    { label: "Successful Settlements", value: stats.endedCount, icon: Trophy, suffix: "" },
  ];

  return (
    <section
      ref={containerRef}
      className="py-16 sm:py-20 bg-zinc-950 text-white border-y border-zinc-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              data-stat-box
              className="text-center sm:text-left border-l border-zinc-800/80 pl-6 space-y-2"
            >
              <div className="flex items-center gap-2 text-indigo-400">
                <item.icon className="h-4 w-4" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  METRIC {idx + 1}
                </span>
              </div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white">
                <StatCounter value={item.value} suffix={item.suffix} />
              </p>
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
