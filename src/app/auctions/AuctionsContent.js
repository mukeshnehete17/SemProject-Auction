"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/auction/AuctionCard";
import SearchBar from "@/components/ui/SearchBar";
import FilterBar from "@/components/ui/FilterBar";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { SlidersHorizontal, X, PackageSearch } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "ending_soon", label: "Ending Soon" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Ended" },
  { value: "cancelled", label: "Cancelled" },
];

const sortOptions = [
  { value: "ending_soon", label: "Ending Soon" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "most_bids", label: "Most Bids" },
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
        className="w-full sm:w-44"
      />
      <Select
        name="status"
        value={filters.status}
        onChange={(e) => commit({ ...filters, status: e.target.value }, true)}
        options={statusOptions}
        className="w-full sm:w-40"
      />
      <Select
        name="sort"
        value={filters.sort}
        onChange={(e) => commit({ ...filters, sort: e.target.value }, true)}
        options={sortOptions}
        className="w-full sm:w-44"
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
          className="w-full sm:w-28 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={filters.maxPrice}
          onChange={(e) => handleNumericChange("maxPrice", e.target.value)}
          placeholder="Max ₹"
          aria-label="Maximum price"
          className="w-full sm:w-28 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900">Explore Auctions</h1>
          <p className="mt-2 text-gray-600">
            Find products you want and place your best bid.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SearchBar
              value={filters.search}
              onChange={(e) => commit({ ...filters, search: e.target.value })}
              placeholder="Search auctions..."
              className="flex-1"
            />
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="hidden lg:block">
            <FilterBar>{filterControls}</FilterBar>
          </div>

          {mobileFilterOpen && (
            <div className="lg:hidden bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
                  />
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={filters.maxPrice}
                    onChange={(e) => handleNumericChange("maxPrice", e.target.value)}
                    placeholder="Max ₹"
                    aria-label="Maximum price"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{auctions.length}</span>{" "}
            auction{auctions.length === 1 ? "" : "s"} found
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {auctions.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="mt-6 bg-gray-50 rounded-xl">
            <EmptyState
              icon={PackageSearch}
              title="No auctions found"
              description="Try adjusting your search or filters to find what you're looking for."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          </div>
        )}
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}