"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { cancelAuctionAction } from "@/lib/auction-actions";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Eye, Edit, Trash2, Plus, Package } from "lucide-react";

const tabs = ["All", "Active", "Upcoming", "Ended", "Cancelled"];

function getFilteredAuctions(auctions, activeTab) {
  if (activeTab === "All") return auctions;
  return auctions.filter((auction) => auction.status === activeTab.toLowerCase());
}

function canEdit(auction) {
  return auction.status === "upcoming";
}

function canCancel(auction) {
  if (auction.status === "cancelled" || auction.status === "ended") return false;
  if (auction.status === "upcoming") return true;
  return (auction.status === "active" || auction.status === "ending_soon") && auction.numberOfBids === 0;
}

export default function MyAuctionsContent({ auctions, initialCreated, initialUpdated }) {
  const [activeTab, setActiveTab] = useState("All");
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [list, setList] = useState(auctions);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const [initialToast] = useState(() => {
    if (initialCreated) return "Auction created successfully!";
    if (initialUpdated) return "Auction updated successfully!";
    return null;
  });

  const showToast = (msg, type = "success") => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = getFilteredAuctions(list, activeTab);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError("");
    const result = await cancelAuctionAction(cancelTarget.id);
    setCancelling(false);

    if (result?.error) {
      setCancelError(result.error);
      return;
    }

    setList((prev) =>
      prev.map((a) => (a.id === cancelTarget.id ? { ...a, status: "cancelled" } : a))
    );
    setCancelTarget(null);
    showToast("Auction cancelled successfully");
  };

  const renderToast = () => (
    <>
      {initialToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-950 border border-zinc-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl">
          {initialToast}
        </div>
      )}
      {toastMessage && (
        <div
          className={`fixed bottom-20 right-5 z-50 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl ${
            toastType === "success"
              ? "bg-zinc-950 border border-zinc-800"
              : "bg-rose-950 border border-rose-800 text-rose-200"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {renderToast()}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
            Consignor Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
            My Consigned Auctions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage, edit, monitor, and cancel your marketplace inventory.
          </p>
        </div>
        <Button href="/dashboard/create-auction" variant="primary" size="md">
          <Plus className="h-4 w-4" />
          <span>Consign New Lot</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-xs sm:text-sm font-bold tracking-tight border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? "border-zinc-950 text-zinc-950"
                : "border-transparent text-zinc-400 hover:text-zinc-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Auctions Found"
          description={`You do not currently possess any ${activeTab.toLowerCase()} auction records.`}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3.5">Lot / Auction</th>
                  <th className="px-4 py-3.5">Current Valuation</th>
                  <th className="px-4 py-3.5">Bids</th>
                  <th className="px-4 py-3.5">Close Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Winning Party</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filtered.map((auction) => (
                  <tr key={auction.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-zinc-200">
                          <ImageWithFallback
                            src={auction.image}
                            alt={auction.title}
                            category={auction.category}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="text-xs font-bold text-zinc-950 truncate">
                            {auction.title}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400">
                            LOT #{String(auction.id).slice(-4).padStart(4, "0")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-950 text-sm">
                      {auction.numberOfBids > 0
                        ? formatPrice(auction.currentPrice)
                        : <span className="text-zinc-400 font-normal">Opening {formatPrice(auction.startingPrice)}</span>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-600">
                      {auction.numberOfBids}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-500 text-[11px]">
                      {formatDateTime(auction.endTime)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={auction.status} />
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {auction.status === "ended" ? (
                        auction.winner ? (
                          <span className="font-semibold text-zinc-900">
                            {auction.winner.bidderName} ·{" "}
                            <span className="font-mono text-indigo-600">
                              {formatPrice(auction.winner.amount)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px]">No reserve reached</span>
                        )
                      ) : (
                        <span className="text-zinc-300 font-mono">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/auctions/${auction.id}`}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                          title="View Auction Room"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canEdit(auction) && (
                          <Link
                            href={`/dashboard/my-auctions/${auction.id}/edit`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Listing Details"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        {canCancel(auction) && (
                          <button
                            onClick={() => {
                              setCancelError("");
                              setCancelTarget(auction);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Cancel Listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3.5">
            {filtered.map((auction) => (
              <div
                key={auction.id}
                className="bg-white rounded-2xl border border-zinc-200/90 p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-200">
                    <ImageWithFallback
                      src={auction.image}
                      alt={auction.title}
                      category={auction.category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-950 truncate">
                      {auction.title}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={auction.status} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-zinc-100">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">Current Valuation</span>
                    <p className="font-mono font-bold text-zinc-950 mt-0.5">
                      {auction.numberOfBids > 0
                        ? formatPrice(auction.currentPrice)
                        : formatPrice(auction.startingPrice)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">Total Bids</span>
                    <p className="font-mono text-zinc-700 mt-0.5">{auction.numberOfBids}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-mono text-zinc-400">Scheduled Close</span>
                    <p className="font-mono text-zinc-600 mt-0.5">{formatDateTime(auction.endTime)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <Link
                    href={`/auctions/${auction.id}`}
                    className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {canEdit(auction) && (
                    <Link
                      href={`/dashboard/my-auctions/${auction.id}/edit`}
                      className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  )}
                  {canCancel(auction) && (
                    <button
                      onClick={() => {
                        setCancelError("");
                        setCancelTarget(auction);
                      }}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Auction Lot"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-950">
                {cancelTarget?.title}
              </p>
              <p className="text-[11px] text-zinc-500">
                Are you certain you wish to withdraw this lot from the auction catalog?
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Cancelling an auction permanently closes participation and removes it from public search. This transaction cannot be reversed.
          </p>
          {cancelError && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 font-medium">
              {cancelError}
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setCancelTarget(null)}
              disabled={cancelling}
            >
              Keep Auction
            </Button>
            <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Revoking..." : "Confirm Cancellation"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}