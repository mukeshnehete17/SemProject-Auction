import { getCurrentUser } from "@/lib/session";
import { getSellerAnalytics } from "@/lib/seller-analytics";
import SellerAnalyticsContent from "./SellerAnalyticsContent";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Seller Analytics — TORI Marketplace",
  description: "Performance metrics, bidding trends, and portfolio analytics for consignors.",
};

export default async function SellerAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard/seller-analytics");
  }

  if (user.role !== "SELLER" && user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const analytics = await getSellerAnalytics(user.id);

  return (
    <SellerAnalyticsContent
      analytics={analytics}
      userName={user.name}
    />
  );
}
