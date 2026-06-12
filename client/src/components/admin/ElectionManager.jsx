// src/components/admin/ElectionManager.jsx
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
  Users,
  StopCircle,
  X,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import AddElectionModal from './AddElectionModal';

// Custom Confirmation Dialog Component
function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-[#0B1020] border border-white/10 rounded-3xl shadow-2xl p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition flex items-center gap-2"
          >
            {loading && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ElectionManager() {
  const [elections, setElections] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const toast = useToast();

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null, // 'start' or 'end'
    electionId: null,
    electionTitle: '',
    loading: false,
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const { data } = await api.get('/elections');
      let electionsList = data.elections || [];
      const statusOrder = { ACTIVE: 1, UPCOMING: 2, ENDED: 3 };
      electionsList.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      setElections(electionsList);
    } catch {
      toast.error('Failed to load elections');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this election? This action cannot be undone.')) return;
    try {
      await api.delete(`/elections/${id}`);
      setElections((prev) => prev.filter((e) => e.id !== id));
      toast.success('Election deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const openConfirmDialog = (action, electionId, electionTitle) => {
    setConfirmDialog({
      open: true,
      action,
      electionId,
      electionTitle,
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    const { action, electionId, electionTitle } = confirmDialog;
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      if (action === 'start') {
        await api.put(`/elections/${electionId}`, { status: 'ACTIVE' });
        toast.success(`Election "${electionTitle}" started`);
      } else if (action === 'end') {
        await api.put(`/elections/${electionId}`, { status: 'ENDED' });
        toast.success(`Election "${electionTitle}" ended`);
      }
      await fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.error || `${action === 'start' ? 'Start' : 'End'} failed`);
    } finally {
      setConfirmDialog({ open: false, action: null, electionId: null, electionTitle: '', loading: false });
    }
  };

  const handleEdit = (election) => {
    setEditingElection(election);
    setShowAddModal(true);
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
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300">{status}</span>;
    }
  };

  const getPriceTypeBadge = (votePrice) => {
    const isFree = votePrice === 0;
    return isFree ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
        Free
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
        Paid (रू {votePrice})
      </span>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={24} className="text-violet-400" />
          Election Management
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
            onClick={() => {
              setEditingElection(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
          >
            <Plus size={16} />
            Create Election
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="text-left py-4 px-6 font-medium text-gray-400">Title</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Category</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Dates</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Price Type</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Contestants</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Votes</th>
                <th className="text-right py-4 px-6 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-white/[0.05] transition">
                  <td className="py-4 px-6"><span className="font-medium text-white">{e.title}</span></td>
                  <td className="py-4 px-6 text-gray-400">{e.category || 'General'}</td>
                  <td className="py-4 px-6 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(e.startDate).toLocaleDateString()} – {new Date(e.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">{getPriceTypeBadge(e.votePrice)}</td>
                  <td className="py-4 px-6">{getStatusBadge(e.status)}</td>
                  <td className="py-4 px-6 text-white">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-violet-400" />
                      { e.approvedCandidates ?? 0 }
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white font-semibold">{e.totalVotes?.toLocaleString() ?? 0}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {e.status === 'UPCOMING' && (
                        <button
                          onClick={() => openConfirmDialog('start', e.id, e.title)}
                          className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-emerald-400 transition"
                          title="Start Election"
                        >
                          <Play size={16} />
                        </button>
                      )}
                      {e.status === 'ACTIVE' && (
                        <button
                          onClick={() => openConfirmDialog('end', e.id, e.title)}
                          className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-red-400 transition"
                          title="End Election"
                        >
                          <StopCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => handleEdit(e)} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition" title="Edit Election">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="p-2 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition" title="Delete Election">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No elections found.弹</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddElectionModal
        key={editingElection?.id ?? 'create'}
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingElection(null);
        }}
        onSuccess={fetchElections}
        election={editingElection}
      />

      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.action === 'start' ? 'Start Election' : 'End Election'}
        message={
          confirmDialog.action === 'start'
            ? `Are you sure you want to start the election "${confirmDialog.electionTitle}"? Once started, voters can vote and you cannot edit election details.`
            : `Are you sure you want to end the election "${confirmDialog.electionTitle}"? This will close voting permanently.`
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ open: false, action: null, electionId: null, electionTitle: '', loading: false })}
        loading={confirmDialog.loading}
      />
    </div>
  );
}