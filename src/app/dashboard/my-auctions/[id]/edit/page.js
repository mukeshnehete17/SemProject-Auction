import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getCategories } from "@/lib/categories";
import { getAuctionRecord } from "@/lib/auctions";
import { deriveStatus } from "@/lib/auctions";
import { updateAuctionAction } from "@/lib/auction-actions";
import AuctionForm from "@/components/auction/AuctionForm";
import Button from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const pad = (n) => String(n).padStart(2, "0");

function toDateInput(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInput(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditAuctionPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/my-auctions");

  const resolvedParams = await params;
  const auction = await getAuctionRecord(resolvedParams.id);

  if (!auction) {
    redirect("/dashboard/my-auctions");
  }
  if (auction.sellerId !== user.id) {
    redirect("/dashboard/my-auctions");
  }

  const derived = deriveStatus(auction.status, auction.startTime, auction.endTime);
  const bidCount = auction._count?.bids ?? 0;
  const canEdit = derived === "upcoming" && bidCount === 0;

  if (!canEdit) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white rounded-2xl border border-zinc-200 p-8 shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 font-semibold">
          Listing Locked
        </span>
        <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
          This Auction Cannot Be Modified
        </h1>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
          To maintain auction fairness, listings can only be amended while scheduled as upcoming before any bids have been placed.
        </p>
        <div className="pt-2">
          <Button href="/dashboard/my-auctions" variant="primary">
            Return to My Auctions
          </Button>
        </div>
      </div>
    );
  }

  const categories = await getCategories();

  const initialValues = {
    name: auction.title,
    description: auction.description,
    category: String(auction.categoryId),
    imageUrl: auction.image || "",
    startingPrice: auction.startingPrice,
    bidIncrement: auction.minimumIncrement,
    startDate: toDateInput(auction.startTime),
    startTime: toTimeInput(auction.startTime),
    endDate: toDateInput(auction.endTime),
    endTime: toTimeInput(auction.endTime),
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="border-b border-zinc-200/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-zinc-400 mb-2">
          <Link
            href="/dashboard/my-auctions"
            className="hover:text-zinc-950 transition-colors"
          >
            My Consignments
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold truncate max-w-xs">{auction.title}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
          Edit Listing Specifications
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Update lot description, imagery, or timing before bidding begins.
        </p>
      </div>

      <AuctionForm
        categories={categories}
        action={updateAuctionAction.bind(null, auction.id)}
        initialValues={initialValues}
        submitLabel="Update Lot Specifications"
        busyLabel="Saving Amendments..."
      />
    </div>
  );
}