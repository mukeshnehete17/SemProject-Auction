"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  FileText,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Clock,
  User,
  Gavel,
  Package,
  Layers,
  Info,
} from "lucide-react";

const ACTION_COLORS = {
  AUCTION_CREATE: "bg-blue-50 text-blue-700 border-blue-200",
  AUCTION_UPDATE: "bg-zinc-100 text-zinc-700 border-zinc-200",
  AUCTION_CANCEL: "bg-rose-50 text-rose-700 border-rose-200",
  AUCTION_MODERATION_CANCEL: "bg-rose-100 text-rose-800 border-rose-300 font-bold",
  BID_PLACED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ROLE_CHANGE: "bg-amber-50 text-amber-700 border-amber-200",
  AUCTION_SETTLED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function AdminAuditLogsContent({ initialLogs = [], flags = [] }) {
  const [logs] = useState(initialLogs);
  const [selectedAction, setSelectedAction] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) => {
    if (selectedAction !== "all" && log.action !== selectedAction) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = log.actorName?.toLowerCase().includes(q) || log.actorEmail?.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchEntity = String(log.entityId).includes(q) || log.entityType.toLowerCase().includes(q);
      return matchActor || matchAction || matchEntity;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-600 font-semibold">
            Compliance & Moderation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
            Audit Trail & Bidding Moderation
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Immutable system logs and algorithmic anomaly detection for root administrator review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200">
            {logs.length} Recorded Entries
          </span>
        </div>
      </div>

      {/* Algorithmic Suspicious Bidding Flags Section */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950 tracking-tight">
                Suspicious Bidding Heuristics & Flags
              </h2>
              <p className="text-xs text-zinc-500">
                Pattern detection for rapid automated bidding, self-outbidding, or abnormal bid spikes.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
            {flags.length} Flagged Pattern{flags.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Advisory Banner */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-zinc-600">
          <Info className="h-4 w-4 text-zinc-400 shrink-0" />
          <p>
            <strong>Advisory Notice:</strong> Algorithmic flags represent automated anomaly triggers for manual human review. Do not penalize or label accounts fraudulent without independent verification.
          </p>
        </div>

        {flags.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 text-xs flex flex-col items-center">
            <CheckCircle2 className="h-7 w-7 text-emerald-500 mb-2" />
            <span className="font-medium text-zinc-700">No anomalous bidding patterns detected</span>
            <span className="text-[11px] text-zinc-400 mt-0.5">
              High-frequency, self-bidding, and spike monitors are running cleanly.
            </span>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      {flag.flagType.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {new Date(flag.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-900">
                    User: {flag.userName} ({flag.userEmail || "No Email"})
                  </p>
                  <p className="text-xs text-zinc-600">
                    Target Lot:{" "}
                    <Link
                      href={`/auctions/${flag.auctionId}`}
                      className="font-medium text-zinc-950 underline hover:text-indigo-600"
                    >
                      {flag.auctionTitle}
                    </Link>
                  </p>
                  <p className="text-xs font-mono text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-200/80 inline-block">
                    {flag.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/auctions/${flag.auctionId}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 transition-colors"
                  >
                    <span>Inspect Lot</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/admin/users?search=${encodeURIComponent(flag.userName)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    <span>Inspect User</span>
                    <User className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immutable Audit Log Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-2xs space-y-4">
        <div className="p-6 border-b border-zinc-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-zinc-950 tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-zinc-400" />
              <span>Immutable System Audit Trail</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Read-only operational events recorded with actor provenance and entity hashes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Action filter */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="text-xs border border-zinc-300 rounded-lg px-3 py-2 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium"
            >
              <option value="all">All Actions</option>
              <option value="BID_PLACED">Bids Placed</option>
              <option value="AUCTION_CREATE">Auction Creations</option>
              <option value="AUCTION_UPDATE">Auction Modifications</option>
              <option value="AUCTION_CANCEL">Auction Cancellations</option>
              <option value="AUCTION_MODERATION_CANCEL">Admin Cancellations</option>
              <option value="ROLE_CHANGE">Role Changes</option>
              <option value="AUCTION_SETTLED">Auction Settlements</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search actor or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-2 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No audit records match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-zinc-400 font-mono uppercase tracking-wider text-[10px] border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Event Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                {filteredLogs.map((log) => {
                  const actionStyle =
                    ACTION_COLORS[log.action] || "bg-zinc-100 text-zinc-700 border-zinc-200";
                  return (
                    <tr key={log.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${actionStyle}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap font-medium text-zinc-900">
                        {log.entityType} #{log.entityId}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900">{log.actorName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 uppercase">
                            {log.actorRole}
                          </span>
                        </div>
                        {log.actorEmail && (
                          <p className="text-[10px] font-mono text-zinc-400">{log.actorEmail}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        {log.metadata ? (
                          <div className="text-[11px] font-mono text-zinc-600 bg-zinc-50 px-2 py-1 rounded border border-zinc-200/80 truncate">
                            {typeof log.metadata === "object"
                              ? JSON.stringify(log.metadata)
                              : String(log.metadata)}
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
