"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/auction/AuctionCard";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import Select from "@/components/ui/Select";
import EmptyState from "@/components/ui/EmptyState";
import { SlidersHorizontal, X, PackageSearch, RotateCcw } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Live Bidding" },
  { value: "ending_soon", label: "Ending Soon" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Ended Lots" },
  { value: "cancelled", label: "Cancelled" },
];

const sortOptions = [
  { value: "ending_soon", label: "Sort: Closing Soon" },
  { value: "newest", label: "Sort: Newest Listed" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "most_bids", label: "Most Bids Placed" },
];

function defaultValue(value) {
  return value === undefined || value === null ? "" : value;
}

function buildQS(filters) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.sort !== "ending_soon") params.set("sort", filters.sort);
  return params.toString();
}

export default function AuctionsContent({ auctions, categories, initialFilters }) {
  const router = useRouter();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: defaultValue(initialFilters.search),
    category: defaultValue(initialFilters.category) || "all",
    status: defaultValue(initialFilters.status) || "all",
    minPrice: defaultValue(initialFilters.minPrice),
    maxPrice: defaultValue(initialFilters.maxPrice),
    sort: defaultValue(initialFilters.sort) || "ending_soon",
  });

  const timerRef = useRef(null);

  const commit = (next, immediate = false) => {
    setFilters(next);
    const qs = buildQS(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    const navigate = () => router.push(qs ? `/auctions?${qs}` : "/auctions");
    if (immediate) navigate();
    else timerRef.current = setTimeout(navigate, 350);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "All Categories" },
      ...categories.map((c) => ({ value: c.slug, label: c.name })),
    ],
    [categories]
  );

  const handleNumericChange = (key, rawValue) => {
    const cleaned = rawValue.replace(/[^\d]/g, "").slice(0, 9);
    commit({ ...filters, [key]: cleaned });
  };

  const clearFilters = () => {
    commit(
      {
        search: "",
        category: "all",
        status: "all",
        minPrice: "",
        maxPrice: "",
        sort: "ending_soon",
      },
      true
    );
  };

  const hasActiveFilters =
    filters.search.trim() ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.sort !== "ending_soon";

  const filterControls = (
    <>
      <Select
        name="category"
        value={filters.category}
        onChange={(e) => commit({ ...filters, category: e.target.value }, true)}
        options={categoryOptions}
        className="w-full sm:w-48"
      />
      <Select
        name="status"
        value={filters.status}
        onChange={(e) => commit({ ...filters, status: e.target.value }, true)}
        options={statusOptions}
        className="w-full sm:w-44"
      />
      <Select
        name="sort"
        value={filters.sort}
        onChange={(e) => commit({ ...filters, sort: e.target.value }, true)}
        options={sortOptions}
        className="w-full sm:w-48"
      />
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={filters.minPrice}
          onChange={(e) => handleNumericChange("minPrice", e.target.value)}
          placeholder="Min ₹"
          aria-label="Minimum price"
          className="w-full sm:w-28 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-xs sm:text-sm font-mono text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 focus:outline-none transition-colors"
        />
        <span className="text-zinc-400 font-mono">–</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={filters.maxPrice}
          onChange={(e) => handleNumericChange("maxPrice", e.target.value)}
          placeholder="Max ₹"
          aria-label="Maximum price"
          className="w-full sm:w-28 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-xs sm:text-sm font-mono text-zinc-900 placeholder-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 focus:outline-none transition-colors"
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header Banner with Floating Glass Navbar */}
      <div className="bg-zinc-950 text-white border-b border-zinc-900">
        <Navbar />
        <section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">
              The Official Lot Directory
            </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Live Auction Lots
              </h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                Browse verified inventory, filter by department or reserve price, and participate in active bidding.
              </p>
            </div>
            <div className="text-xs font-mono text-zinc-500">
              TOTAL LOTS IN CATALOG: <span className="text-white font-bold">{auctions.length}</span>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Search and Filters Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SearchBar
              value={filters.search}
              onChange={(e) => commit({ ...filters, search: e.target.value })}
              placeholder="Search by lot title, model, or keywords..."
              className="flex-1"
            />
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-300 text-xs font-semibold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          <div className="hidden lg:block pt-1">
            <FilterBar>{filterControls}</FilterBar>
          </div>

          {/* Mobile Filter Panel */}
          {mobileFilterOpen && (
            <div className="lg:hidden bg-zinc-50 rounded-2xl p-5 border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Refine Catalogue
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-700"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Select
                  name="category"
                  value={filters.category}
                  onChange={(e) => commit({ ...filters, category: e.target.value }, true)}
                  options={categoryOptions}
                />
                <Select
                  name="status"
                  value={filters.status}
                  onChange={(e) => commit({ ...filters, status: e.target.value }, true)}
                  options={statusOptions}
                />
                <Select
                  name="sort"
                  value={filters.sort}
                  onChange={(e) => commit({ ...filters, sort: e.target.value }, true)}
                  options={sortOptions}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={filters.minPrice}
                    onChange={(e) => handleNumericChange("minPrice", e.target.value)}
                    placeholder="Min ₹"
                    aria-label="Minimum price"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-xs font-mono text-zinc-900"
                  />
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={filters.maxPrice}
                    onChange={(e) => handleNumericChange("maxPrice", e.target.value)}
                    placeholder="Max ₹"
                    aria-label="Maximum price"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-xs font-mono text-zinc-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Bar */}
        <div className="mt-8 flex items-center justify-between pb-4 border-b border-zinc-200">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Displaying <span className="font-bold text-zinc-950">{auctions.length}</span>{" "}
            lot{auctions.length === 1 ? "" : "s"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Auctions Gallery Grid */}
        {auctions.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={{
                  ...auction,
                  bidCount: auction.numberOfBids,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              icon={PackageSearch}
              title="No Lots Matched Your Criteria"
              description="Adjust your search query or reset the category and price filters to inspect all active auctions."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          </div>
        )}
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}