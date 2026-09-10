import { getAuctionById, getAuctionWinner } from "@/lib/auctions";
import { getCurrentUser } from "@/lib/session";
import { isAuctionInWatchlist } from "@/lib/watchlist";
import AuctionDetailContent from "./AuctionDetailContent";
import { ToastProvider } from "@/components/ui/Toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Auction not found
          </h1>
          <p className="text-gray-600 mb-6">
            The auction you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button href="/auctions" variant="primary">
            Browse Auctions
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