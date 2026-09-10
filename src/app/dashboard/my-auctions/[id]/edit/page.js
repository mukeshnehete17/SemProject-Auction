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
      <div className="max-w-2xl mx-auto text-center py-16">
        <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          This auction can&apos;t be edited
        </h1>
        <p className="text-gray-600 mb-6">
          Auctions can only be edited while they are upcoming and have no bids.
        </p>
        <Button href="/dashboard/my-auctions" variant="primary">
          Back to My Auctions
        </Button>
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
    <div className="space-y-6 max-w-3xl pb-10">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link
            href="/dashboard/my-auctions"
            className="hover:text-gray-900 transition-colors"
          >
            My Auctions
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Edit: {auction.title}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Auction</h1>
        <p className="text-gray-500 mt-1">
          Update the details of your listing
        </p>
      </div>

      <AuctionForm
        categories={categories}
        action={updateAuctionAction.bind(null, auction.id)}
        initialValues={initialValues}
        submitLabel="Save Changes"
        busyLabel="Saving..."
      />
    </div>
  );
}