"use client";

import { useRef } from "react";
import CategoryCard from "@/components/auction/CategoryCard";
import { Grid } from "lucide-react";
import { useGsapStagger } from "@/lib/animations";

export default function HomeCategories({ categories }) {
  const containerRef = useRef(null);
  useGsapStagger(containerRef, "[data-category-item]");

  return (
    <section ref={containerRef} className="py-20 sm:py-24 bg-zinc-50 border-t border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-indigo-600 mb-2 font-semibold">
            <Grid className="h-3.5 w-3.5" />
            <span>Curated Departments</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950">
            Browse by Specialty
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Explore inventory across precision electronics, computing, optics, and rare collectibles.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
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
