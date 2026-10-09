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
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-zinc-200/80 pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
          Consignment Desk
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
          Catalogue a New Auction Lot
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Submit product details, schedule opening and closing windows, and set starting reserves.
        </p>
      </div>

      <AuctionForm
        categories={categories}
        action={createAuctionAction}
        submitLabel="Publish Lot for Bidding"
        busyLabel="Validating & Publishing..."
      />
    </div>
  );
}