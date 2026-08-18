// src/components/admin/UserManager.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Search,
  UserX,
  UserCheck,
  Shield,
  MoreHorizontal,
  Users,
  Clock,
  X,
  Loader2,
  Square,
  SquareCheckBig,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("ALL");
  const toast = useToast();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);

  // Batch selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBatchRoleModal, setShowBatchRoleModal] = useState(false);
  const [batchNewRole, setBatchNewRole] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [stats, setStats] = useState({
    totalVoters: 0,
    approvedCandidates: 0,
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
      setSelectedIds([]);
    } catch (err) {
      console.error("Fetch users error:", err);
      toast.error("Failed to load users");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats({
        totalVoters: res.data.totalVoters || 0,
        approvedCandidates: res.data.approvedCandidates || 0,
      });
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Permanently delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const updateRole = async () => {
    if (!selectedUser || newRole === selectedUser.role) {
      setShowRoleModal(false);
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/admin/users/${selectedUser.id}/role`, { role: newRole });
      toast.success("User role updated");
      fetchUsers();
      setShowRoleModal(false);
    } catch (err) {
      toast.error("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  // Time filter helper
  const getTimeFilterCutoff = () => {
    if (timeFilter === "ALL") return null;
    const now = new Date();
    switch (timeFilter) {
      case "LAST_HOUR":
        return new Date(now.getTime() - 60 * 60 * 1000);
      case "LAST_WEEK":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "THIS_MONTH":
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case "THIS_YEAR":
        return new Date(now.getFullYear(), 0, 1);
      default:
        return null;
    }
  };

  const timeCutoff = getTimeFilterCutoff();

  const filtered = users.filter((u) => {
    const searchMatch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const roleMatch = roleFilter === "ALL" || u.role === roleFilter;
    const timeMatch = !timeCutoff || new Date(u.createdAt) >= timeCutoff;
    return searchMatch && roleMatch && timeMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, timeFilter]);

  const allIds = paginatedUsers.map((u) => u.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} user(s)? This cannot be undone.`)) return;
    try {
      await api.post("/admin/users/batch-delete", { ids: selectedIds });
      toast.success(`${selectedIds.length} user(s) deleted`);
      fetchUsers();
      fetchStats();
      clearSelection();
    } catch (err) {
      toast.error("Batch delete failed");
    }
  };

  const openBatchRoleModal = () => {
    setBatchNewRole("VOTER");
    setShowBatchRoleModal(true);
  };

  const executeBatchRoleUpdate = async () => {
    if (!batchNewRole || selectedIds.length === 0) return;
    setLoading(true);
    try {
      await api.patch("/admin/users/batch-role", {
        ids: selectedIds,
        role: batchNewRole,
      });
      toast.success(`Role updated for ${selectedIds.length} user(s)`);
      fetchUsers();
      setShowBatchRoleModal(false);
      clearSelection();
    } catch (err) {
      toast.error("Batch role update failed");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
            <Shield size={12} /> Admin
          </span>
        );
      case "CONTESTANT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 border border-cyan-200">
            <UserCheck size={12} /> Contestant
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
            <UserCheck size={12} /> Voter
          </span>
        );
    }
  };

  const totalUsers = users.length;
  const totalVoters = users.filter((u) => u.role === "VOTER").length;
  const totalContestants = users.filter((u) => u.role === "CONTESTANT").length;
  const approvedCandidates = stats.approvedCandidates;

  return (
    <div className="p-6 bg-gray-50 text-gray-800 min-h-screen">
      {/* Stats cards (unchanged) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Total Users</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{totalUsers}</h3>
            </div>
            <Users className="text-violet-500" size={24} />
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Total Voters</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{totalVoters}</h3>
            </div>
            <UserCheck className="text-emerald-500" size={24} />
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Total Contestants</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{totalContestants}</h3>
            </div>
            <Shield className="text-cyan-500" size={24} />
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Verified Contestants</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{approvedCandidates}</h3>
            </div>
            <UserCheck className="text-amber-500" size={24} />
          </div>
        </div>
      </div>

      {/* Header + search/role/time filters (unchanged) */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">List of Users</h2>
            <p className="text-gray-500 text-sm">
              {filtered.length} of {totalUsers} user{totalUsers !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition w-full sm:w-[220px]">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-gray-800 w-full placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm transition w-full sm:w-[180px]">
              <Shield size={18} className="text-violet-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white text-gray-800 w-full outline-none cursor-pointer rounded-2xl"
              >
                <option value="ALL">All Roles</option>
                <option value="VOTER">Voter</option>
                <option value="CONTESTANT">Contestant</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm transition w-full sm:w-[190px]">
              <Clock size={18} className="text-violet-500" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-white text-gray-800 w-full outline-none cursor-pointer rounded-2xl"
              >
                <option value="ALL">All Time</option>
                <option value="LAST_HOUR">Last hour</option>
                <option value="LAST_WEEK">Last week</option>
                <option value="THIS_MONTH">This month</option>
                <option value="THIS_YEAR">This year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Batch actions bar (unchanged) */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center gap-3 flex-wrap rounded-2xl bg-violet-50 border border-violet-200 px-5 py-3">
          <span className="text-violet-800 font-medium text-sm">
            {selectedIds.length} user{selectedIds.length !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={clearSelection}
            className="text-violet-600 hover:text-violet-800 underline text-sm ml-auto"
          >
            Clear selection
          </button>
          <button
            onClick={openBatchRoleModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 transition text-sm font-medium"
          >
            <Pencil size={16} />
            Change Role
          </button>
          <button
            onClick={handleBatchDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}

      {/* USER TABLE – actions now visible buttons */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <tr>
                <th className="p-4 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-violet-600 transition"
                    title={allSelected ? "Deselect all" : "Select all"}
                  >
                    {allSelected ? (
                      <SquareCheckBig size={18} className="text-violet-600" />
                    ) : someSelected ? (
                      <SquareCheckBig size={18} className="text-violet-400" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((u) => {
                const isSelected = selectedIds.includes(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-gray-50 transition ${isSelected ? "bg-violet-50" : ""}`}
                  >
                    <td className="p-4">
                      <button
                        onClick={() => toggleUser(u.id)}
                        className="text-gray-400 hover:text-violet-600 transition"
                      >
                        {isSelected ? (
                          <SquareCheckBig size={18} className="text-violet-600" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">{getRoleBadge(u.role)}</td>
                    <td className="p-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {/* Action buttons now always visible */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openRoleModal(u)}
                          className="p-2 rounded-lg hover:bg-violet-50 text-violet-600 transition"
                          title="Change role"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls (unchanged) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Individual Role Change Modal (unchanged) */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl p-6">
            <button
              onClick={() => setShowRoleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition"
            >
              <X size={18} className="text-gray-500" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Change Role for {selectedUser.firstName} {selectedUser.lastName}
            </h3>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-violet-500 mb-6"
            >
              <option value="VOTER">Voter</option>
              <option value="CONTESTANT">Contestant</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateRole}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center gap-2 text-white"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Role Change Modal (unchanged) */}
      {showBatchRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl p-6">
            <button
              onClick={() => setShowBatchRoleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition"
            >
              <X size={18} className="text-gray-500" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Change Role for {selectedIds.length} user
              {selectedIds.length !== 1 ? "s" : ""}
            </h3>
            <select
              value={batchNewRole}
              onChange={(e) => setBatchNewRole(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:border-violet-500 mb-6"
            >
              <option value="VOTER">Voter</option>
              <option value="CONTESTANT">Contestant</option>
              <option value="ADMIN">Admin</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBatchRoleModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeBatchRoleUpdate}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center gap-2 text-white"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Update Roles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}