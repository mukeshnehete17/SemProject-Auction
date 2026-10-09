import { getWonAuctionsByUser } from "@/lib/auctions";
import { getCurrentUser } from "@/lib/session";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Trophy, Calendar, User, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

export const dynamic = "force-dynamic";

export default async function WonAuctionsPage() {
  const user = await getCurrentUser();
  const wonAuctions = user ? await getWonAuctionsByUser(user.id) : [];

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200/80 pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 font-semibold">
          Certified Acquisitions
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
          Won Auction Lots
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Catalogued items where you placed the winning hammer valuation.
        </p>
      </div>

      {wonAuctions.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No Won Auctions Yet"
          description="When you place the winning bid and the auction clock expires, your claim certificate will appear here."
          actionLabel="Explore Live Catalogue"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wonAuctions.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs hover:border-zinc-300 hover:shadow-md transition-all flex flex-col"
            >
              <Link href={`/auctions/${item.id}`} className="block relative h-48 bg-zinc-100 overflow-hidden group">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Trophy className="h-3 w-3" />
                    <span>Won Lot</span>
                  </span>
                </div>
              </Link>

              <div className="p-5 sm:p-6 space-y-4 flex flex-col flex-1">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    LOT #{String(item.id).slice(-4).padStart(4, "0")}
                  </span>
                  <Link href={`/auctions/${item.id}`}>
                    <h3 className="text-base font-bold text-zinc-950 hover:text-indigo-600 transition-colors line-clamp-1 mt-0.5">
                      {item.title}
                    </h3>
                  </Link>
                </div>

                <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                      Hammer Valuation
                    </span>
                    <p className="text-xl font-black font-mono text-zinc-950 mt-0.5">
                      {formatPrice(item.winningBid)}
                    </p>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <div className="space-y-1.5 text-xs text-zinc-600 pt-1">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Seller: {item.seller}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Concluded: {formatDateTime(item.endTime)}</span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                    Escrow Ready
                  </span>
                  <Button href={`/auctions/${item.id}`} variant="primary" size="sm" className="group">
                    <span>Inspect Lot</span>
                    <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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