"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { addToWatchlist, removeFromWatchlist } from "@/lib/watchlist";

export async function addWatchlistAction(auctionId) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to use your watchlist." };

  const result = await addToWatchlist(user.id, auctionId);
  if (result.ok) {
    revalidatePath(`/auctions/${auctionId}`);
    revalidatePath("/dashboard/watchlist");
    revalidatePath("/dashboard");
    return { ok: true };
  }
  return result;
}

export async function removeWatchlistAction(auctionId) {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to use your watchlist." };

  const result = await removeFromWatchlist(user.id, auctionId);
  if (result.ok) {
    revalidatePath(`/auctions/${auctionId}`);
    revalidatePath("/dashboard/watchlist");
    revalidatePath("/dashboard");
    return { ok: true };
  }
  return result;
}