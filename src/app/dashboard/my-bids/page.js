import { getCurrentUser } from "@/lib/session";
import { getBidsByUser } from "@/lib/bids";
import MyBidsContent from "./MyBidsContent";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyBidsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/my-bids");

  const bids = await getBidsByUser(user.id);

  return <MyBidsContent bids={bids} />;
}