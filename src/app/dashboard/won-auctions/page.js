import { getWonAuctionsByUser } from "@/lib/auctions";
import { getCurrentUser } from "@/lib/session";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Trophy, Package, Calendar, User } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function WonAuctionsPage() {
  const user = await getCurrentUser();
  const wonAuctions = user ? await getWonAuctionsByUser(user.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Won Auctions</h1>
        <p className="text-gray-500 mt-1">Items you&apos;ve successfully won</p>
      </div>

      {wonAuctions.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No won auctions yet"
          description="When you win an auction, it will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {wonAuctions.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <Link href={`/auctions/${item.id}`}>
                <div className="h-40 bg-amber-50 flex items-center justify-center">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Trophy className="h-12 w-12 text-amber-400" />
                  )}
                </div>
              </Link>
              <div className="p-5 space-y-3">
                <Link href={`/auctions/${item.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatPrice(item.winningBid)}
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{item.seller}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Auction ended: {formatDateTime(item.endTime)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <StatusBadge status={item.status} />
                  <Button href={`/auctions/${item.id}`} variant="outline" size="sm">
                    <Package className="h-4 w-4" />
                    View Item
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}