"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/ui/SearchBar";
import StatusBadge from "@/components/ui/StatusBadge";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { adminCancelAuctionAction } from "@/lib/admin-actions";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Eye, Ban, PackageX, Package, ShieldAlert } from "lucide-react";

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
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b hairline-border">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#7c3aed] block mb-2">
            Catalog Governance
          </span>
          <h1 className="editorial-display text-3xl sm:text-4xl text-[#0d0d0d]">
            Auctions Register
          </h1>
          <p className="editorial-sub text-sm sm:text-base text-[#666666] mt-2 max-w-xl">
            Audit live, upcoming, and archival listings across the TORI marketplace exchange.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full border hairline-border bg-white text-xs font-mono text-[#0d0d0d]">
            <span className="font-semibold text-[#7c3aed]">{auctions.length}</span> Lots Found
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border hairline-border flex flex-col lg:flex-row lg:items-center gap-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
          placeholder="Filter by title or catalog ID..."
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
          <Button variant="outline" size="sm" onClick={handleClear} className="self-start lg:self-auto">
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table / Empty State */}
      {auctions.length === 0 ? (
        <div className="bg-white rounded-2xl border hairline-border p-8">
          <EmptyState
            icon={Package}
            title="No auction listings located"
            description="Adjust your search criteria or review filters to locate existing catalogue lots."
            actionLabel={hasFilters ? "Clear Filters" : undefined}
            onAction={hasFilters ? handleClear : undefined}
          />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border hairline-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y hairline-border">
                <thead className="bg-[#f9f9fb]">
                  <tr>
                    <th className="px-6 py-4 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-[#666666]">
                      Lot / Category
                    </th>
                    <th className="px-6 py-4 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-[#666666]">
                      Consignor
                    </th>
                    <th className="px-6 py-4 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-[#666666]">
                      Valuation
                    </th>
                    <th className="px-6 py-4 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-[#666666]">
                      Bids
                    </th>
                    <th className="px-6 py-4 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-[#666666]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-[#666666]">
                      Closing Schedule
                    </th>
                    <th className="px-6 py-4 text-right font-mono text-[11px] font-medium uppercase tracking-wider text-[#666666]">
                      Moderation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y hairline-border bg-white">
                  {auctions.map((auction) => (
                    <tr key={auction.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3.5">
                          <div className="h-11 w-11 rounded-lg bg-[#f0f0f3] overflow-hidden shrink-0 border hairline-border relative">
                            <ImageWithFallback
                              src={auction.image}
                              alt={auction.title}
                              category={auction.category}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                          <div className="max-w-[220px]">
                            <span className="text-sm font-medium text-[#0d0d0d] block truncate">
                              {auction.title}
                            </span>
                            <span className="font-mono text-xs text-[#7c3aed]">
                              {auction.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#444444] whitespace-nowrap">
                        {auction.seller?.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-[#0d0d0d]">
                          {formatPrice(auction.currentPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#f5f5f7] text-[#444444] border hairline-border">
                          {auction.numberOfBids} bids
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={auction.status} />
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[#666666] whitespace-nowrap">
                        {formatDateTime(auction.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewAuction(auction)}
                            className="p-2 rounded-lg text-[#666666] hover:text-[#7c3aed] hover:bg-[#7c3aed]/5 transition-colors"
                            aria-label={`View ${auction.title}`}
                            title="Inspect dossier"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {isCancellable(auction) ? (
                            <button
                              onClick={() => setCancelTarget(auction)}
                              className="p-2 rounded-lg text-[#666666] hover:text-[#dc2626] hover:bg-rose-50 transition-colors"
                              aria-label={`Cancel ${auction.title}`}
                              title="Revoke / Cancel listing"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <span
                              className="p-2 text-[#cccccc] cursor-not-allowed"
                              title="Locked: only upcoming or zero-bid auctions can be revoked"
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
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-white rounded-2xl border hairline-border p-4.5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-[#f0f0f3] overflow-hidden shrink-0 border hairline-border relative">
                      <ImageWithFallback
                        src={auction.image}
                        alt={auction.title}
                        category={auction.category}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0d0d0d] truncate">
                        {auction.title}
                      </p>
                      <p className="text-xs text-[#7c3aed] font-mono">
                        {auction.category} · {auction.seller?.name || "—"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={auction.status} />
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y hairline-border text-center">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#888888] block">Valuation</span>
                    <span className="font-mono text-xs font-semibold text-[#0d0d0d]">
                      {formatPrice(auction.currentPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#888888] block">Offers</span>
                    <span className="font-mono text-xs text-[#444444]">{auction.numberOfBids}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase text-[#888888] block">End</span>
                    <span className="font-mono text-[11px] text-[#666666] truncate block">
                      {new Date(auction.endTime).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setViewAuction(auction)}>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Details
                  </Button>
                  {isCancellable(auction) && (
                    <Button variant="danger" size="sm" onClick={() => setCancelTarget(auction)}>
                      <Ban className="h-3.5 w-3.5 mr-1" />
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={!!viewAuction}
        onClose={() => setViewAuction(null)}
        title="Lot Dossier"
        size="lg"
      >
        {viewAuction && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 pb-4 border-b hairline-border">
              <div className="w-16 h-16 rounded-xl bg-[#f0f0f3] overflow-hidden shrink-0 border hairline-border relative">
                <ImageWithFallback
                  src={viewAuction.image}
                  alt={viewAuction.title}
                  category={viewAuction.category}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-mono text-xs text-[#7c3aed] uppercase tracking-wider block">
                  {viewAuction.category}
                </span>
                <h3 className="editorial-display text-xl text-[#0d0d0d] truncate">
                  {viewAuction.title}
                </h3>
                <p className="text-xs text-[#666666] mt-0.5">
                  Consigned by <span className="text-[#0d0d0d] font-medium">{viewAuction.seller?.name || "Unknown"}</span>
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#fafafc] p-4.5 rounded-xl border hairline-border">
              <div>
                <dt className="font-mono text-[10px] uppercase text-[#888888]">Status</dt>
                <dd className="mt-1"><StatusBadge status={viewAuction.status} /></dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-[#888888]">Current Bid</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-[#0d0d0d]">
                  {formatPrice(viewAuction.currentPrice)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-[#888888]">Starting Price</dt>
                <dd className="mt-1 font-mono text-sm text-[#444444]">
                  {formatPrice(viewAuction.startingPrice)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-[#888888]">Recorded Bids</dt>
                <dd className="mt-1 font-mono text-sm text-[#444444]">{viewAuction.numberOfBids}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-[#888888]">Opening</dt>
                <dd className="mt-1 font-mono text-xs text-[#666666]">
                  {formatDateTime(viewAuction.startTime)}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase text-[#888888]">Closing</dt>
                <dd className="mt-1 font-mono text-xs text-[#666666]">
                  {formatDateTime(viewAuction.endTime)}
                </dd>
              </div>
              {viewAuction.winner && (
                <div className="col-span-full pt-3 border-t hairline-border">
                  <dt className="font-mono text-[10px] uppercase text-[#888888]">Winning Bidder</dt>
                  <dd className="mt-1 text-sm font-medium text-[#0d0d0d] flex items-center justify-between">
                    <span>{viewAuction.winner.name}</span>
                    <span className="font-mono text-[#7c3aed]">{formatPrice(viewAuction.winner.amount)}</span>
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setViewAuction(null)}>
                Dismiss
              </Button>
              {isCancellable(viewAuction) && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setCancelTarget(viewAuction);
                    setViewAuction(null);
                  }}
                >
                  <Ban className="h-4 w-4 mr-1.5" />
                  Cancel Listing
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => !cancelling && setCancelTarget(null)}
        title="Revoke Auction Lot"
        size="sm"
      >
        {cancelTarget && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 rounded-xl border border-rose-200">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 leading-relaxed">
                Confirm cancellation of <strong className="font-semibold text-rose-950">“{cancelTarget.title}”</strong>. This action terminates the bidding lifecycle and marks the listing as cancelled.
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCancelTarget(null)} disabled={cancelling}>
                Retain
              </Button>
              <Button variant="danger" onClick={runCancel} disabled={cancelling}>
                {cancelling ? "Revoking..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
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