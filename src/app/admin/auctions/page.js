import AdminAuctionsContent from "./AdminAuctionsContent";
import { getAdminUser, getAdminAuctions } from "@/lib/admin";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set(["active", "ending_soon", "upcoming", "ended", "cancelled"]);

export default async function AdminAuctionsPage({ searchParams }) {
  const admin = await getAdminUser();
  const sp = await searchParams;

  const search = typeof sp?.search === "string" ? sp.search : "";
  const status = VALID_STATUSES.has(sp?.status) ? sp.status : "all";

  const auctions = await getAdminAuctions({ search, status });
  const queryKey = `${search}|${status}`;

  return (
    <AdminAuctionsContent
      key={queryKey}
      auctions={auctions}
      initialSearch={search}
      initialStatus={status}
    />
  );
}