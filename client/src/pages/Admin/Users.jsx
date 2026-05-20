// src/pages/Admin/Users.jsx
import { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      console.log('Users fetched:', res.data); // debug log
      setUsers(res.data.data);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      await API.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchUsers(); // refresh list
      setEditingRole(null);
    } catch (error) {
      console.error('Update role error:', error);
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user? All votes and data will be removed.')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers(); // refresh list
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(error.response?.data?.message || 'Deletion failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading users...</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No users found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Users Management</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-white/10">
            <tr>
              <th className="py-3 text-gray-400">Name</th>
              <th className="py-3 text-gray-400">Email</th>
              <th className="py-3 text-gray-400">Role</th>
              <th className="py-3 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5">
                <td className="py-3 text-white">{user.name}</td>
                <td className="py-3 text-gray-300">{user.email}</td>
                <td className="py-3">
                  {editingRole === user.id ? (
                    <select
                      defaultValue={user.role}
                      onBlur={(e) => updateRole(user.id, e.target.value)}
                      className="bg-[#12121b] border border-white/10 rounded px-2 py-1 text-white"
                    >
                      <option value="VOTER">Voter</option>
                      <option value="CANDIDATE">Candidate</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  ) : (
                    <span className="text-gray-300">{user.role}</span>
                  )}
                </td>
                <td className="py-3">
                  <button
                    onClick={() => setEditingRole(user.id)}
                    className="text-blue-400 hover:text-blue-300 mr-3 text-sm"
                  >
                    Edit Role
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;