"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { cancelAuctionAction } from "@/lib/auction-actions";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Eye, Edit, Trash2, Plus, Package, ImageOff } from "lucide-react";

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
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg animate-fade-in">
          {initialToast}
        </div>
      )}
      {toastMessage && (
        <div
          className={`fixed bottom-20 right-4 z-50 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg animate-fade-in ${
            toastType === "success" ? "bg-green-600" : "bg-red-600"
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Auctions</h1>
          <p className="text-gray-500 mt-1">Manage your auction listings</p>
        </div>
        <Button href="/dashboard/create-auction" variant="primary" size="md">
          <Plus className="h-4 w-4" />
          Create Auction
        </Button>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No auctions found"
          description={`You don't have any ${activeTab.toLowerCase()} auctions yet.`}
        />
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Auction
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Current Bid
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Bids
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    End Time
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Winner
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((auction) => (
                  <tr key={auction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {auction.image ? (
                          <img
                            src={auction.image}
                            alt={auction.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {auction.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {auction.numberOfBids > 0
                        ? formatPrice(auction.currentPrice)
                        : "No bids"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{auction.numberOfBids}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDateTime(auction.endTime)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={auction.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {auction.status === "ended" ? (
                        auction.winner ? (
                          <span>
                            {auction.winner.bidderName} ·{" "}
                            <span className="font-semibold text-gray-900">
                              {formatPrice(auction.winner.amount)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">No winner</span>
                        )
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
<div>
                    <p className="text-gray-500">Status</p>
                    <StatusBadge status={auction.status} />
                  </div>
                  <div>
                    <p className="text-gray-500">Winner</p>
                    {auction.status === "ended" ? (
                      auction.winner ? (
                        <p className="text-gray-700">
                          {auction.winner.bidderName} ·{" "}
                          <span className="font-semibold text-gray-900">
                            {formatPrice(auction.winner.amount)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-gray-400">No winner</p>
                      )
                    ) : (
                      <p className="text-gray-400">—</p>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/auctions/${auction.id}`}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {canEdit(auction) && (
                          <Link
                            href={`/dashboard/my-auctions/${auction.id}/edit`}
                            className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit"
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
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Cancel"
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

          <div className="md:hidden space-y-3">
            {filtered.map((auction) => (
              <div
                key={auction.id}
                className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  {auction.image ? (
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <ImageOff className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {auction.title}
                    </p>
                    <StatusBadge status={auction.status} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Current Bid</p>
                    <p className="font-semibold text-gray-900">
                      {auction.numberOfBids > 0
                        ? formatPrice(auction.currentPrice)
                        : "No bids"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bids</p>
                    <p className="text-gray-700">{auction.numberOfBids}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">End Time</p>
                    <p className="text-gray-700">{formatDateTime(auction.endTime)}</p>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/auctions/${auction.id}`}
                      className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {canEdit(auction) && (
                      <Link
                        href={`/dashboard/my-auctions/${auction.id}/edit`}
                        className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
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
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Auction"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {cancelTarget?.title}
              </p>
              <p className="text-xs text-gray-500">
                Are you sure you want to cancel this auction?
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Cancelling an auction removes it from public listings. This action
            cannot be undone.
          </p>
          {cancelError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {cancelError}
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setCancelTarget(null)}
              disabled={cancelling}
            >
              Keep Auction
            </Button>
            <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Cancel Auction"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}