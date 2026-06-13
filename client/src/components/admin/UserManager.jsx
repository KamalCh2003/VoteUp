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
  UserCog,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [joinDateFilter, setJoinDateFilter] = useState("");
  const toast = useToast();

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error("Failed to delete user");
    }
    setOpenDropdownId(null);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
    setOpenDropdownId(null);
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

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200"><Shield size={12}/> Admin</span>;
      case "CONTESTANT":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 border border-cyan-200"><UserCheck size={12}/> Contestant</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"><UserCheck size={12}/> Voter</span>;
    }
  };

  const totalUsers = users.length;
  const totalVoters = users.filter((u) => u.role === "VOTER").length;
  const totalContestants = users.filter((u) => u.role === "CONTESTANT").length;
  const approvedCandidates = stats.approvedCandidates;

  const filtered = users.filter((u) => {
    const searchMatch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const roleMatch = roleFilter === "ALL" ? true : u.role === roleFilter;
    const dateMatch = !joinDateFilter ? true : new Date(u.createdAt).toISOString().split("T")[0] === joinDateFilter;
    return searchMatch && roleMatch && dateMatch;
  });

  return (
    <div className="p-6 bg-gray-50 text-gray-800 min-h-screen">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Total Users</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</h3></div>
            <Users className="text-violet-500" size={28} />
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Total Voters</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{totalVoters}</h3></div>
            <UserCheck className="text-emerald-500" size={28} />
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Total Contestants</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{totalContestants}</h3></div>
            <Shield className="text-cyan-500" size={28} />
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Verified Contestants</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{approvedCandidates}</h3></div>
            <UserCheck className="text-amber-500" size={28} />
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Filters & Search</h2>
            <p className="text-gray-500 text-sm">Refine users by role or keywords</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition w-full sm:w-[220px]">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-gray-800 w-full placeholder:text-gray-400" />
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
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" value={joinDateFilter} onChange={(e) => setJoinDateFilter(e.target.value)} className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800" />
            </div>
          </div>
        </div>
      </div>

      {/* USER TABLE */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">{getRoleBadge(u.role)}</td>
                  <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right relative">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === u.id ? null : u.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <MoreHorizontal size={18} className="text-gray-500" />
                    </button>
                    {openDropdownId === u.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => openRoleModal(u)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                          >
                            <Shield size={14} className="text-violet-500"/>
                            Change Role
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <UserX size={14}/>
                            Delete User
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl p-6">
            <button onClick={() => setShowRoleModal(false)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition"><X size={18} className="text-gray-500"/></button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Change Role for {selectedUser.firstName} {selectedUser.lastName}</h3>
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
              <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={updateRole} disabled={loading} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center gap-2 text-white">
                {loading && <Loader2 size={16} className="animate-spin"/>} Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}