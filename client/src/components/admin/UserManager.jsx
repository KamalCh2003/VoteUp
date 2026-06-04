import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, UserX, UserCheck, Shield, MoreHorizontal } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/users')
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => toast.error('Failed to load users'));
  }, []);

  const filtered = users.filter(
    (u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Shield size={12} /> Admin
          </span>
        );
      case 'CONTESTANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <UserCheck size={12} /> Contestant
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <UserCheck size={12} /> Voter
          </span>
        );
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    // Placeholder – implement suspend/activate API call
    toast.success(`User ${currentStatus ? 'suspended' : 'activated'} (simulation)`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="text-left py-4 px-6 font-medium text-gray-400">User</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Email</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Role</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Joined</th>
                <th className="text-right py-4 px-6 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.05] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <span className="font-medium text-white">
                        {u.firstName} {u.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-400">{u.email}</td>
                  <td className="py-4 px-6">{getRoleBadge(u.role)}</td>
                  <td className="py-4 px-6">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-red-400">
                        <span className="h-2 w-2 rounded-full bg-red-400"></span> Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        className="p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white"
                        title={u.isActive ? 'Suspend' : 'Activate'}
                      >
                        {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button className="p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}