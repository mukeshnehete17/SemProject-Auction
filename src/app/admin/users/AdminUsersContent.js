"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { adminChangeRoleAction } from "@/lib/admin-actions";
import { formatDateTime } from "@/lib/utils";
import { Eye, ArrowLeftRight, Users, ShieldAlert } from "lucide-react";

const tabs = [
  { key: "all", label: "All Members" },
  { key: "BUYER", label: "Buyers" },
  { key: "SELLER", label: "Sellers" },
  { key: "ADMIN", label: "Admins" },
];

const roleStyles = {
  BUYER: "bg-zinc-100 text-zinc-700 border-zinc-200",
  SELLER: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  ADMIN: "bg-rose-50 text-rose-700 border-rose-200/80 font-bold",
};

const ROLE_OPTIONS = [
  { value: "BUYER", label: "Buyer" },
  { value: "SELLER", label: "Seller" },
];

function getInitials(name) {
  return (name || "?")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function RoleBadge({ role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${
        roleStyles[role] || "bg-zinc-100 text-zinc-700 border-zinc-200"
      }`}
    >
      {role.toLowerCase()}
    </span>
  );
}

function AdminUsersContentInner({ users, currentAdminId }) {
  const { toast } = useToast();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewUser, setViewUser] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [changing, setChanging] = useState(false);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);
      const matchesTab = activeTab === "all" || user.role === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [users, search, activeTab]);

  const openRoleChange = (user) => {
    setConfirm({
      user,
      newRole: user.role === "BUYER" ? "SELLER" : "BUYER",
    });
  };

  const runRoleChange = async () => {
    if (!confirm) return;
    setChanging(true);
    const res = await adminChangeRoleAction(confirm.user.id, confirm.newRole);
    setChanging(false);
    setConfirm(null);
    if (res.ok) {
      toast(`Role updated successfully for ${confirm.user.name}`);
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  };

  const canChangeRole = (user) =>
    user.role !== "ADMIN" && user.id !== currentAdminId;

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200/80 pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
          Directory Management
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
          Registered Collector Accounts
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Inspect bidder credentials, change account clearance levels, and verify identity.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by full name or email address..."
          className="lg:max-w-md flex-1"
        />
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Showing <span className="font-bold text-zinc-950">{filteredUsers.length}</span> of {users.length} members
        </span>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-zinc-950 text-white shadow-2xs"
                : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Matching Accounts Found"
          description="Adjust your search query or reset the role filter to view directory members."
        />
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-2xl border border-zinc-200/90 overflow-hidden shadow-2xs">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3.5">Member Identity</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Bids Placed</th>
                  <th className="px-4 py-3.5">Lots Created</th>
                  <th className="px-4 py-3.5">Lots Won</th>
                  <th className="px-4 py-3.5">Enrolled Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-950 text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <span className="font-bold text-zinc-950 block">
                            {user.name}
                            {user.id === currentAdminId && (
                              <span className="ml-1.5 text-[10px] font-mono text-rose-600 font-semibold">(current)</span>
                            )}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-700 whitespace-nowrap">
                      {user.bidsPlaced}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-700 whitespace-nowrap">
                      {user.auctionsCreated}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-700 whitespace-nowrap font-bold">
                      {user.auctionsWon}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewUser(user)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
                          aria-label={`View ${user.name}`}
                          title="View Profile Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canChangeRole(user) ? (
                          <button
                            onClick={() => openRoleChange(user)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            aria-label={`Change role for ${user.name}`}
                            title="Toggle Role Clearance"
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <span
                            className="p-1.5 rounded-lg text-zinc-300 cursor-not-allowed"
                            title="Admin roles or self-profile cannot be altered"
                          >
                            <ArrowLeftRight className="h-4 w-4 opacity-40" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3.5">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-zinc-200/90 p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-950 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">
                        {user.name}
                        {user.id === currentAdminId && (
                          <span className="ml-1 text-[10px] font-mono text-rose-600">(current)</span>
                        )}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                  <RoleBadge role={user.role} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-zinc-100 font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-zinc-400">Bids</span>
                    <p className="font-bold text-zinc-900 mt-0.5">{user.bidsPlaced}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-zinc-400">Created</span>
                    <p className="font-bold text-zinc-900 mt-0.5">{user.auctionsCreated}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-zinc-400">Won</span>
                    <p className="font-bold text-zinc-900 mt-0.5">{user.auctionsWon}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <span className="text-[10px] font-mono text-zinc-400">
                    Enrolled {formatDateTime(user.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewUser(user)}>
                      View
                    </Button>
                    {canChangeRole(user) && (
                      <Button variant="outline" size="sm" onClick={() => openRoleChange(user)}>
                        Role
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* View User Modal */}
      <Modal
        isOpen={!!viewUser}
        onClose={() => setViewUser(null)}
        title="Member Dossier"
        size="md"
      >
        {viewUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-950 text-white flex items-center justify-center text-lg font-bold font-mono shrink-0">
                {getInitials(viewUser.name)}
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950">{viewUser.name}</h3>
                <p className="text-xs font-mono text-zinc-400">{viewUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400">Assigned Role</span>
                <div className="mt-1"><RoleBadge role={viewUser.role} /></div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400">Joined Platform</span>
                <p className="mt-1 font-mono text-zinc-900">{formatDateTime(viewUser.createdAt)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400">Total Bids Placed</span>
                <p className="mt-1 font-mono font-bold text-zinc-900">{viewUser.bidsPlaced}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400">Total Auctions Won</span>
                <p className="mt-1 font-mono font-bold text-zinc-900">{viewUser.auctionsWon}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Lots Consigned / Created</span>
                <p className="mt-1 font-mono font-bold text-zinc-900">{viewUser.auctionsCreated}</p>
              </div>
            </div>

            {canChangeRole(viewUser) && (
              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100">
                <Button variant="outline" size="sm" onClick={() => setViewUser(null)}>
                  Close
                </Button>
                <Button size="sm" onClick={() => openRoleChange(viewUser)}>
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span>Toggle Role</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Role Change Modal */}
      <Modal
        isOpen={!!confirm}
        onClose={() => !changing && setConfirm(null)}
        title="Amend Role Clearance"
        size="sm"
      >
        {confirm && (
          <div className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Amend user clearance for{" "}
              <span className="font-bold text-zinc-950">{confirm.user.name}</span> from{" "}
              <RoleBadge role={confirm.user.role} /> to:
            </p>

            <div>
              <label
                htmlFor="admin-role"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5"
              >
                Target Privilege Level
              </label>
              <select
                id="admin-role"
                value={confirm.newRole}
                onChange={(e) =>
                  setConfirm((prev) => ({ ...prev, newRole: e.target.value }))
                }
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-xs font-mono text-zinc-900 bg-white focus:border-zinc-950 focus:outline-none"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <Button variant="outline" size="sm" onClick={() => setConfirm(null)} disabled={changing}>
                Cancel
              </Button>
              <Button size="sm" onClick={runRoleChange} disabled={changing}>
                {changing ? "Writing DB..." : "Confirm Role Update"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AdminUsersContent({ users, currentAdminId }) {
  return (
    <ToastProvider>
      <AdminUsersContentInner users={users} currentAdminId={currentAdminId} />
    </ToastProvider>
  );
}