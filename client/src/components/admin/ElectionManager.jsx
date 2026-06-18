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
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import AddElectionModal from './AddElectionModal';

function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white border border-gray-200 rounded-3xl shadow-2xl p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const toast = useToast();

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    electionId: null,
    electionTitle: '',
    loading: false,
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async (status = statusFilter) => {
    try {
      const params = status !== 'ALL' ? { status } : {};
      const { data } = await api.get('/elections', { params });
      let electionsList = data.elections || [];
      // Sort: pending first, then active, upcoming, ended
      const statusOrder = { PENDING: 0, ACTIVE: 1, UPCOMING: 2, ENDED: 3 };
      electionsList.sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));
      setElections(electionsList);
    } catch (err) {
      toast.error('Failed to load elections');
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    fetchElections(newStatus);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this election? This action cannot be undone.')) return;
    try {
      await api.delete(`/elections/${id}`);
      toast.success('Election deleted');
      fetchElections();
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

  const handleApprove = async (id, title) => {
    if (!window.confirm(`Approve the election request "${title}"?`)) return;
    try {
      await api.patch(`/admin/elections/${id}/approve`);
      toast.success(`Election "${title}" approved`);
      fetchElections();
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id, title) => {
    const reason = prompt(`Rejection reason for "${title}" (optional):`);
    if (reason === null) return; // user cancelled
    try {
      await api.patch(`/admin/elections/${id}/reject`, { rejectionReason: reason || null });
      toast.success(`Election "${title}" rejected`);
      fetchElections();
    } catch (err) {
      toast.error('Rejection failed');
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
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <Clock size={12} /> Pending
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <Clock size={12} />
            Upcoming
          </span>
        );
      case 'ENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <Square size={12} />
            Ended
          </span>
        );
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getPriceTypeBadge = (votePrice) => {
    const isFree = votePrice === 0;
    return isFree ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        Free
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        Paid (रू {votePrice})
      </span>
    );
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 size={24} className="text-violet-600" />
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-violet-500"
          >
            <option value="ALL">All Elections</option>
            <option value="PENDING">Pending Requests</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="ENDED">Ended</option>
          </select>
          <Button
            variant="primary"
            onClick={() => {
              setEditingElection(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus size={16} />
            Create Election
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-medium text-gray-500">Title</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500">Category</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500">Dates</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500">Price Type</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500">Contestants</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500">Votes</th>
                <th className="text-right py-4 px-6 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6"><span className="font-medium text-gray-800">{e.title}</span></td>
                  <td className="py-4 px-6 text-gray-600">{e.category || 'General'}</td>
                  <td className="py-4 px-6 text-gray-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(e.startDate).toLocaleDateString()} – {new Date(e.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-6">{getPriceTypeBadge(e.votePrice)}</td>
                  <td className="py-4 px-6">{getStatusBadge(e.status)}</td>
                  <td className="py-4 px-6 text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-violet-500" />
                      {e.approvedCandidates ?? 0}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700 font-semibold">{e.totalVotes?.toLocaleString() ?? 0}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {e.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(e.id, e.title)}
                            className="p-2 rounded-xl hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(e.id, e.title)}
                            className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {e.status === 'UPCOMING' && (
                        <button
                          onClick={() => openConfirmDialog('start', e.id, e.title)}
                          className="p-2 rounded-xl hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition"
                          title="Start Election"
                        >
                          <Play size={16} />
                        </button>
                      )}
                      {e.status === 'ACTIVE' && (
                        <button
                          onClick={() => openConfirmDialog('end', e.id, e.title)}
                          className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                          title="End Election"
                        >
                          <StopCircle size={16} />
                        </button>
                      )}
                      {(e.status === 'UPCOMING' || e.status === 'ACTIVE' || e.status === 'ENDED' || e.status === 'CANCELLED') && (
                        <>
                          <button onClick={() => handleEdit(e)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition" title="Edit Election">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(e.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition" title="Delete Election">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No elections found.</td></tr>
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
        onSuccess={() => fetchElections()}
        election={editingElection}
      />

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