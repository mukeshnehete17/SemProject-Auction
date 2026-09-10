"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/ui/SearchBar";
import StatusBadge from "@/components/ui/StatusBadge";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { adminCancelAuctionAction } from "@/lib/admin-actions";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Eye, Ban, PackageX, Package } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "ending_soon", label: "Ending Soon" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Ended" },
  { value: "cancelled", label: "Cancelled" },
];

function isCancellable(auction) {
  return (
    auction.status === "upcoming" ||
    ((auction.status === "active" || auction.status === "ending_soon") &&
      auction.numberOfBids === 0)
  );
}

function AdminAuctionsContentInner({ auctions, initialSearch, initialStatus }) {
  const { toast } = useToast();
  const router = useRouter();

  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  const pushFilters = (nextSearch, nextStatus) => {
    const params = new URLSearchParams();
    if (nextSearch) params.set("search", nextSearch);
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    const qs = params.toString();
    router.push(`/admin/auctions${qs ? `?${qs}` : ""}`);
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter") {
      pushFilters(search.trim(), status);
    }
  };

  const handleClear = () => {
    setSearch("");
    setStatus("all");
    pushFilters("", "all");
  };

  const [viewAuction, setViewAuction] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const runCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    const res = await adminCancelAuctionAction(cancelTarget.id);
    setCancelling(false);
    setCancelTarget(null);
    if (res.ok) {
      toast(`"${cancelTarget.title}" has been cancelled`);
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  };

  const hasFilters = Boolean(search.trim()) || status !== "all";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Auctions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search, review and moderate all auctions
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
          placeholder="Search by title..."
          className="lg:max-w-md flex-1"
        />
        <Select
          name="status"
          value={status}
          onChange={(e) => pushFilters(search.trim(), e.target.value)}
          options={statusOptions}
          className="lg:w-56"
        />
        {hasFilters && (
          <Button variant="outline" onClick={handleClear}>
            Clear Filters
          </Button>
        )}
        <span className="text-sm text-gray-500 ml-auto">
          {auctions.length} auction{auctions.length === 1 ? "" : "s"}
        </span>
      </div>

      {auctions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={Package}
            title="No auctions found"
            description="Try adjusting your search or status filter."
          />
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Bid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {auctions.map((auction) => (
                  <tr key={auction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                          <PackageIconImage image={auction.image} title={auction.title} />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">{auction.title}</span>
                          <span className="text-xs text-gray-500">{auction.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {auction.seller?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatPrice(auction.currentPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {auction.numberOfBids}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={auction.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDateTime(auction.endTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewAuction(auction)}
                          className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          aria-label={`View ${auction.title}`}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {isCancellable(auction) ? (
                          <button
                            onClick={() => setCancelTarget(auction)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Cancel ${auction.title}`}
                            title="Cancel auction"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <span
                            className="p-2 rounded-lg text-gray-300 cursor-not-allowed"
                            title="Only upcoming, or active auctions without bids, can be cancelled"
                          >
                            <Ban className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                      <PackageIconImage image={auction.image} title={auction.title} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{auction.title}</p>
                      <p className="text-xs text-gray-500">{auction.category} · {auction.seller?.name || "—"}</p>
                    </div>
                  </div>
                  <StatusBadge status={auction.status} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Current Bid</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{formatPrice(auction.currentPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bids</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{auction.numberOfBids}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ends</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{formatDateTime(auction.endTime)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <Button variant="outline" size="sm" onClick={() => setViewAuction(auction)}>
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  {isCancellable(auction) && (
                    <Button variant="danger" size="sm" onClick={() => setCancelTarget(auction)}>
                      <Ban className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={!!viewAuction}
        onClose={() => setViewAuction(null)}
        title="Auction Details"
        size="lg"
      >
        {viewAuction && (
          <div>
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900">{viewAuction.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {viewAuction.category} · sold by {viewAuction.seller?.name || "Unknown"}
              </p>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Status</dt>
                <dd className="mt-1"><StatusBadge status={viewAuction.status} /></dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Current Bid</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatPrice(viewAuction.currentPrice)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Starting Price</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatPrice(viewAuction.startingPrice)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Number of Bids</dt>
                <dd className="mt-1 text-sm text-gray-900">{viewAuction.numberOfBids}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Start Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDateTime(viewAuction.startTime)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">End Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDateTime(viewAuction.endTime)}</dd>
              </div>
              {viewAuction.winner && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-gray-500 uppercase">Winner</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {viewAuction.winner.name} · {formatPrice(viewAuction.winner.amount)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
              <Button variant="outline" onClick={() => setViewAuction(null)}>
                Close
              </Button>
              {isCancellable(viewAuction) && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setCancelTarget(viewAuction);
                    setViewAuction(null);
                  }}
                >
                  <Ban className="h-4 w-4" />
                  Cancel Auction
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!cancelTarget}
        onClose={() => !cancelling && setCancelTarget(null)}
        title="Cancel Auction"
        size="sm"
      >
        {cancelTarget && (
          <div>
            <p className="text-sm text-gray-600 flex items-start gap-2 mb-4">
              <PackageX className="h-5 w-5 text-red-500 shrink-0" />
              <span>
                Are you sure you want to cancel{" "}
                <span className="font-semibold text-gray-900">“{cancelTarget.title}”</span>?
                This cannot be undone.
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={cancelling}>
                Keep Auction
              </Button>
              <Button variant="danger" onClick={runCancel} disabled={cancelling}>
                {cancelling ? "Cancelling..." : "Cancel Auction"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function PackageIconImage({ image, title }) {
  if (!image) return <Package className="h-4 w-4" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image} alt={title} className="h-9 w-9 rounded-lg object-cover" />;
}

export default function AdminAuctionsContent({ auctions, initialSearch, initialStatus }) {
  return (
    <ToastProvider>
      <AdminAuctionsContentInner
        auctions={auctions}
        initialSearch={initialSearch}
        initialStatus={initialStatus}
      />
    </ToastProvider>
  );
}