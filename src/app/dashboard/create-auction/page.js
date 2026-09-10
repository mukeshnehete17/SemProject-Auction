import { getCurrentUser } from "@/lib/session";
import { getCategories } from "@/lib/categories";
import { createAuctionAction } from "@/lib/auction-actions";
import AuctionForm from "@/components/auction/AuctionForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CreateAuctionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/create-auction");
  if (user.role !== "SELLER" && user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const categories = await getCategories();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Auction</h1>
        <p className="text-gray-500 mt-1">List your product for auction</p>
      </div>

      <AuctionForm
        categories={categories}
        action={createAuctionAction}
        submitLabel="Create Auction"
        busyLabel="Creating..."
      />
    </div>
  );
}