// src/components/admin/ElectionManager.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 added for navigation
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
  Square as SquareIcon,
  SquareCheckBig,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye, // 👈 added for view icon
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import AddElectionModal from './AddElectionModal';

// Custom Confirmation Dialog (unchanged)
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
  const navigate = useNavigate(); // 👈 for navigation to detail
  const [elections, setElections] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priceFilter, setPriceFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const toast = useToast();

  // Batch selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingBatch, setLoadingBatch] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  const fetchElections = async () => {
    try {
      const { data } = await api.get('/elections');
      let electionsList = data.elections || [];
      const statusOrder = { ACTIVE: 1, UPCOMING: 2, ENDED: 3 };
      electionsList.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
      setElections(electionsList);
      setSelectedIds([]);
      setCurrentPage(1);
    } catch {
      toast.error('Failed to load elections');
    }
  };

  const categories = useMemo(() => {
    const cats = new Set();
    elections.forEach(e => { if (e.category) cats.add(e.category); });
    return Array.from(cats).sort();
  }, [elections]);

  const getTimeFilterCutoff = () => {
    if (timeFilter === 'ALL') return null;
    const now = new Date();
    switch (timeFilter) {
      case 'TODAY': {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return today;
      }
      case 'LAST_7_DAYS':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'LAST_30_DAYS':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'THIS_YEAR':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return null;
    }
  };

  const timeCutoff = getTimeFilterCutoff();

  const filtered = elections.filter((e) => {
    const searchMatch = e.title.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'ALL' || e.status === statusFilter;
    const categoryMatch = categoryFilter === 'ALL' || e.category === categoryFilter;
    const priceMatch =
      priceFilter === 'ALL' ||
      (priceFilter === 'FREE' && e.votePrice === 0) ||
      (priceFilter === 'PAID' && e.votePrice > 0);
    const timeMatch = !timeCutoff ? true : new Date(e.createdAt) >= timeCutoff;
    return searchMatch && statusMatch && categoryMatch && priceMatch && timeMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedElections = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  // Selection logic
  const allIds = filtered.map(e => e.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(allIds);
  };

  const toggleElection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.length} election(s)?`)) return;
    setLoadingBatch(true);
    try {
      await api.post('/elections/batch-delete', { ids: selectedIds });
      toast.success(`${selectedIds.length} election(s) deleted`);
      fetchElections();
      clearSelection();
    } catch (err) {
      toast.error('Batch delete failed');
    } finally {
      setLoadingBatch(false);
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

  const getStatusBadge = (status) => {
    switch (status) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={24} className="text-violet-600" />
            Election List
          </h2>
          <p className="text-gray-500 text-sm">
            {filtered.length} of {elections.length} election{elections.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search elections..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 px-2 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800">
            <Filter size={16} className="text-violet-500" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-white outline-none cursor-pointer "
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ENDED">Ended</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 px-2 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800">
            <BarChart3 size={16} className="text-violet-500" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-white outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Paid/Free Filter */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800">
            <Filter size={16} className="text-violet-500" />
            <select
              value={priceFilter}
              onChange={(e) => { setPriceFilter(e.target.value); setCurrentPage(1); }}
              className="bg-white outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800">
            <Clock size={16} className="text-violet-500" />
            <select
              value={timeFilter}
              onChange={(e) => { setTimeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-white outline-none cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 days</option>
              <option value="LAST_30_DAYS">Last 30 days</option>
              <option value="THIS_YEAR">This year</option>
            </select>
          </div>

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

      {/* Batch actions bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center gap-3 flex-wrap rounded-2xl bg-violet-50 border border-violet-200 px-5 py-3">
          <span className="text-violet-800 font-medium text-sm">
            {selectedIds.length} election{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={clearSelection}
            className="text-violet-600 hover:text-violet-800 underline text-sm ml-auto"
          >
            Clear selection
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={loadingBatch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition text-sm font-medium disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete Selected
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-4 w-10">
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
                      <SquareIcon size={18} />
                    )}
                  </button>
                </th>
                <th className="text-left py-4 px-4 font-medium text-gray-500">Title</th>
                <th className="text-left py-4 px-4 font-medium text-gray-500">Category</th>
                <th className="text-left py-4 px-4 font-medium text-gray-500">Dates</th>
                <th className="text-left py-4 px-4 font-medium text-gray-500">Price Type</th>
                <th className="text-left py-4 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-4 px-4 font-medium text-gray-500">Contestants</th>
                <th className="text-left py-4 px-4 font-medium text-gray-500">Votes</th>
                <th className="text-right py-4 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedElections.map((e) => {
                const isSelected = selectedIds.includes(e.id);
                return (
                  <tr key={e.id} className={`hover:bg-gray-50 transition ${isSelected ? 'bg-violet-50' : ''}`}>
                    <td className="py-4 px-4" onClick={(ev) => ev.stopPropagation()}>
                      <button
                        onClick={() => toggleElection(e.id)}
                        className="text-gray-400 hover:text-violet-600 transition"
                      >
                        {isSelected ? (
                          <SquareCheckBig size={18} className="text-violet-600" />
                        ) : (
                          <SquareIcon size={18} />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      {/* 👇 Clickable title navigates to detail */}
                      <span
                        className="font-medium text-gray-800 cursor-pointer hover:text-violet-600 transition"
                        onClick={() => navigate(`/admin/elections/${e.id}`)}
                      >
                        {e.title}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{e.category || 'General'}</td>
                    <td className="py-4 px-4 text-gray-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {new Date(e.startDate).toLocaleDateString()} – {new Date(e.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">{getPriceTypeBadge(e.votePrice)}</td>
                    <td className="py-4 px-4">{getStatusBadge(e.status)}</td>
                    <td className="py-4 px-4 text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-violet-500" />
                        {e.approvedCandidates ?? 0}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 font-semibold">{e.totalVotes?.toLocaleString() ?? 0}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
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
                        {/* 👇 View button navigates to detail */}
                        <button
                          onClick={() => navigate(`/admin/elections/${e.id}`)}
                          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEdit(e)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition" title="Edit Election">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(e.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition" title="Delete Election">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedElections.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">No elections found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm">
            <button onClick={() => goToPage(currentPage-1)} disabled={currentPage===1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16}/></button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => goToPage(currentPage+1)} disabled={currentPage===totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16}/></button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
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

      {/* Start/End Confirmation */}
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