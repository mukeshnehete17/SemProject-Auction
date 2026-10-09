"use client";

import { useRef } from "react";
import CategoryCard from "@/components/auction/CategoryCard";
import { Grid, Sparkles } from "lucide-react";
import { useGsapStagger } from "@/lib/animations";

export default function HomeCategories({ categories }) {
  const containerRef = useRef(null);
  useGsapStagger(containerRef, "[data-category-item]");

  return (
    <section ref={containerRef} className="py-24 sm:py-28 bg-zinc-950 text-white border-t border-zinc-900 relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-violet-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-violet-400 mb-3 font-semibold px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>Curated Departments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Browse by Specialty
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-xl">
              Explore authenticated inventory across precision electronics, high-end computing, luxury horology, optics, and rare collectibles.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database-Verified Live Lots</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div key={category.name} data-category-item>
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
