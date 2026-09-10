import { getCurrentUser } from "@/lib/session";
import { getAuctionsBySeller } from "@/lib/auctions";
import MyAuctionsContent from "./MyAuctionsContent";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyAuctionsPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/my-auctions");

  const auctions = await getAuctionsBySeller(user.id);
  const sp = await searchParams;

  return (
    <MyAuctionsContent
      auctions={auctions}
      initialCreated={sp?.created === "1"}
      initialUpdated={sp?.updated === "1"}
    />
  );
}