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
import { Eye, ArrowLeftRight, Users } from "lucide-react";

const tabs = [
  { key: "all", label: "All" },
  { key: "BUYER", label: "Buyers" },
  { key: "SELLER", label: "Sellers" },
  { key: "ADMIN", label: "Admins" },
];

const roleStyles = {
  BUYER: "bg-indigo-50 text-indigo-700",
  SELLER: "bg-green-50 text-green-700",
  ADMIN: "bg-red-50 text-red-700",
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
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        roleStyles[role] || "bg-gray-50 text-gray-700"
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
      toast(`Role updated for ${confirm.user.name}`);
      router.refresh();
    } else {
      toast(res.error, "error");
    }
  };

  const canChangeRole = (user) =>
    user.role !== "ADMIN" && user.id !== currentAdminId;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all registered users
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="lg:max-w-md flex-1"
        />
        <span className="text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try adjusting your search or filter to find users."
          />
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bids Placed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auctions Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Won</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {user.name}
                            {user.id === currentAdminId && (
                              <span className="ml-2 text-xs text-gray-400">(you)</span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {user.bidsPlaced}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {user.auctionsCreated}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {user.auctionsWon}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewUser(user)}
                          className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          aria-label={`View ${user.name}`}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canChangeRole(user) ? (
                          <button
                            onClick={() => openRoleChange(user)}
                            className="p-2 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                            aria-label={`Change role for ${user.name}`}
                            title="Change role"
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <span
                            className="p-2 rounded-lg text-gray-300 cursor-not-allowed"
                            title={
                              user.role === "ADMIN"
                                ? "Admin roles cannot be changed"
                                : "You cannot change your own role"
                            }
                          >
                            <ArrowLeftRight className="h-4 w-4" />
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
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                        {user.id === currentAdminId && (
                          <span className="ml-2 text-xs text-gray-400">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <RoleBadge role={user.role} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Bids</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{user.bidsPlaced}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{user.auctionsCreated}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Won</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{user.auctionsWon}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Joined {formatDateTime(user.createdAt)}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    {canChangeRole(user) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRoleChange(user)}
                      >
                        <ArrowLeftRight className="h-4 w-4" />
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

      <Modal
        isOpen={!!viewUser}
        onClose={() => setViewUser(null)}
        title="User Details"
        size="lg"
      >
        {viewUser && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold shrink-0">
                {getInitials(viewUser.name)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{viewUser.name}</h3>
                <p className="text-sm text-gray-500">{viewUser.email}</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Role</dt>
                <dd className="mt-1"><RoleBadge role={viewUser.role} /></dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Joined</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDateTime(viewUser.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Bids Placed</dt>
                <dd className="mt-1 text-sm text-gray-900">{viewUser.bidsPlaced}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Auctions Won</dt>
                <dd className="mt-1 text-sm text-gray-900">{viewUser.auctionsWon}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">Auctions Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{viewUser.auctionsCreated}</dd>
              </div>
            </dl>

            {canChangeRole(viewUser) && (
              <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
                <Button variant="outline" onClick={() => setViewUser(null)}>
                  Close
                </Button>
                <Button onClick={() => openRoleChange(viewUser)}>
                  <ArrowLeftRight className="h-4 w-4" />
                  Change Role
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!confirm}
        onClose={() => !changing && setConfirm(null)}
        title="Confirm Role Change"
        size="sm"
      >
        {confirm && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Change the role of{" "}
              <span className="font-semibold text-gray-900">{confirm.user.name}</span>{" "}
              from <RoleBadge role={confirm.user.role} /> to a{" "}
              <span className="capitalize font-medium">{confirm.newRole.toLowerCase()}</span>?
            </p>
            <div className="mb-4">
              <label
                htmlFor="admin-role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Role
              </label>
              <select
                id="admin-role"
                value={confirm.newRole}
                onChange={(e) =>
                  setConfirm((prev) => ({ ...prev, newRole: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirm(null)} disabled={changing}>
                Cancel
              </Button>
              <Button onClick={runRoleChange} disabled={changing}>
                {changing ? "Saving..." : "Confirm"}
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