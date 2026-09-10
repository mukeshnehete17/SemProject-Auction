import { formatPrice } from "@/lib/utils";

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
      <div className="text-center py-8 text-sm text-gray-500">
        No bids yet. Be the first to bid!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
              Bidder
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
              Amount
            </th>
            <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bids.map((bid, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {bid.bidder}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-indigo-600">
                {formatPrice(bid.amount)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {timeAgo(bid.time)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
