import { formatPrice } from "@/lib/utils";
import { UserCheck } from "lucide-react";

function timeAgo(time) {
  const diff = Date.now() - new Date(time).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export default function BidHistory({ bids = [] }) {
  if (bids.length === 0) {
    return (
      <div className="text-center py-12 text-xs font-mono text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
        No bids have been recorded yet. Place the inaugural bid!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200/90">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-3">Bidder</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-xs">
          {bids.map((bid, index) => (
            <tr
              key={index}
              className={`hover:bg-zinc-50/80 transition-colors ${
                index === 0 ? "bg-indigo-50/20" : ""
              }`}
            >
              <td className="px-4 py-3 font-semibold text-zinc-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-[10px] font-bold">
                  {bid.bidder?.[0]?.toUpperCase() || "B"}
                </div>
                <span>{bid.bidder}</span>
              </td>
              <td className="px-4 py-3 font-mono font-bold text-zinc-950 text-sm">
                {formatPrice(bid.amount)}
              </td>
              <td className="px-4 py-3 font-mono text-zinc-400 text-[11px]">
                {timeAgo(bid.time)}
              </td>
              <td className="px-4 py-3 text-right">
                {index === 0 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <UserCheck className="h-3 w-3" />
                    Leading
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400">Outbid</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
