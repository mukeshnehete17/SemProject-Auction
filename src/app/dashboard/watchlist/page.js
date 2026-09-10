import { getCurrentUser } from "@/lib/session";
import { getUserWatchlist } from "@/lib/watchlist";
import WatchlistContent from "./WatchlistContent";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const user = await getCurrentUser();
  const items = user ? await getUserWatchlist(user.id) : [];

  return <WatchlistContent items={items} />;
}