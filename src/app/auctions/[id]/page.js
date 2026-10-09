import { getAuctionById, getAuctionWinner } from "@/lib/auctions";
import { getCurrentUser } from "@/lib/session";
import { isAuctionInWatchlist } from "@/lib/watchlist";
import AuctionDetailContent from "./AuctionDetailContent";
import { ToastProvider } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { PackageSearch } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuctionDetailPage({ params }) {
  const resolvedParams = await params;
  const [auction, currentUser, winner] = await Promise.all([
    getAuctionById(resolvedParams.id),
    getCurrentUser(),
    getAuctionWinner(resolvedParams.id),
  ]);

  const isWatched =
    !!auction && !!currentUser
      ? await isAuctionInWatchlist(currentUser.id, auction.id)
      : false;

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center my-auto">
          <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto mb-6 text-zinc-400">
            <PackageSearch className="h-8 w-8" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            Record Not Found
          </span>
          <h1 className="text-3xl font-black text-zinc-950 mt-1 mb-3 tracking-tight">
            Auction Lot Unavailable
          </h1>
          <p className="text-sm text-zinc-500 mb-8 max-w-sm mx-auto">
            The requested lot does not exist in the database or has been archived from public listing.
          </p>
          <Button href="/auctions" variant="primary" size="lg">
            Return to Catalogue
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ToastProvider>
      <AuctionDetailContent
        auction={auction}
        currentUser={currentUser}
        winner={winner}
        isWatched={isWatched}
      />
    </ToastProvider>
  );
}