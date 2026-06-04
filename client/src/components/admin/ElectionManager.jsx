import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Play,
  Square,
  Calendar,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import AddElectionModal from './AddElectionModal';

export default function ElectionManager() {
  const [elections, setElections] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const { data } = await api.get('/elections');
      setElections(data.elections || []);
    } catch {
      toast.error('Failed to load elections');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this election?')) return;
    try {
      await api.delete(`/elections/${id}`);
      setElections((prev) => prev.filter((e) => e.id !== id));
      toast.success('Election deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'ENDED' : 'ACTIVE';
    try {
      await api.put(`/elections/${id}`, { status: newStatus });
      setElections((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      toast.success(
        `Election ${newStatus === 'ACTIVE' ? 'started' : 'stopped'}`
      );
    } catch {
      toast.error('Status change failed');
    }
  };

  const filtered = elections.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock size={12} />
            Upcoming
          </span>
        );
      case 'ENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300 border border-gray-500/30">
            <Square size={12} />
            Ended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={24} className="text-violet-400" />
          Election Management
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search elections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
          >
            <Plus size={16} />
            Create Election
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="text-left py-4 px-6 font-medium text-gray-400">Title</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Category</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Dates</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Votes</th>
                <th className="text-right py-4 px-6 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-white/[0.05] transition"
                >
                  <td className="py-4 px-6">
                    <span className="font-medium text-white">{e.title}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-400">
                    {e.category || 'General'}
                  </td>
                  <td className="py-4 px-6 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(e.startDate).toLocaleDateString()} –{' '}
                      {new Date(e.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">{getStatusBadge(e.status)}</td>
                  <td className="py-4 px-6 text-white font-semibold">
                    {e.totalVotes?.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {e.status !== 'ENDED' && (
                        <button
                          onClick={() => handleToggleStatus(e.id, e.status)}
                          className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
                          title={
                            e.status === 'ACTIVE'
                              ? 'Stop Election'
                              : 'Start Election'
                          }
                        >
                          {e.status === 'ACTIVE' ? (
                            <Square size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          toast.success('Edit not yet implemented')
                        }
                        className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-2 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No elections found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Add Election Modal */}
      <AddElectionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchElections}
      />
    </div>
  );
}