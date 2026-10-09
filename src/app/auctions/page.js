import AuctionsContent from "./AuctionsContent";
import { getAuctions } from "@/lib/auctions";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(["active", "ending_soon", "upcoming", "ended", "cancelled"]);
const VALID_SORTS = new Set(["ending_soon", "newest", "price_low", "price_high", "most_bids"]);

function parseNonNeg(value) {
  if (typeof value !== "string" || value.trim() === "") return "";
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? String(num) : "";
}

export default async function AuctionsPage({ searchParams }) {
  const sp = await searchParams;
  const categories = await getCategories();
  const rawCategory = typeof sp?.category === "string" ? sp.category.trim() : "";
  const matchedCategory = categories.find(
    (c) =>
      c.slug.toLowerCase() === rawCategory.toLowerCase() ||
      c.name.toLowerCase() === rawCategory.toLowerCase()
  );
  const category = matchedCategory ? matchedCategory.slug : "all";

  const filters = {
    search: typeof sp?.search === "string" ? sp.search.trim().slice(0, 100) : "",
    category,
    status: VALID_STATUSES.has(sp?.status) ? sp.status : "all",
    minPrice: parseNonNeg(sp?.minPrice),
    maxPrice: parseNonNeg(sp?.maxPrice),
    sort: VALID_SORTS.has(sp?.sort) ? sp.sort : "ending_soon",
  };

  const auctionFilters = {
    ...filters,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
  };

  const auctions = await getAuctions(auctionFilters);

  const queryKey = [
    filters.search,
    filters.category,
    filters.status,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
  ].join("|");

  return (
    <AuctionsContent
      key={queryKey}
      auctions={auctions}
      categories={categories}
      initialFilters={filters}
    />
  );
}