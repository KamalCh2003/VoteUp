// src/components/admin/CandidateManager.jsx
import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import {
  Search, Check, X, UserCheck, Mail, Calendar, PartyPopper, Quote, FileText,
  XCircle, Users, UserCog, UserMinus, Eye, Edit, ChevronLeft, ChevronRight, Trash2,
  Square, SquareCheckBig, Clock, UserPlus,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import AddCandidateModal from './AddCandidateModal';
import EditCandidateModal from './EditCandidateModal';

export default function ContestantManagement() {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [electionFilter, setElectionFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 3 columns × 3 rows
  const toast = useToast();

  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingBatch, setLoadingBatch] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchElections();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data } = await api.get('/admin/candidates');
      setCandidates(data.candidates || []);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to load contestants');
    }
  };

  const fetchElections = async () => {
    try {
      const { data } = await api.get('/elections');
      setElections(data.elections || []);
    } catch {}
  };

  const candidatesWithRank = useMemo(() => {
    const grouped = new Map();
    candidates.forEach(c => {
      const electionId = c.election?.id;
      if (!electionId) return;
      if (!grouped.has(electionId)) grouped.set(electionId, []);
      grouped.get(electionId).push(c);
    });
    for (let [electionId, group] of grouped.entries()) {
      group.sort((a, b) => b.votesReceived - a.votesReceived);
      group.forEach((c, idx) => { c.rank = idx + 1; });
    }
    return candidates;
  }, [candidates]);

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

  const filtered = candidatesWithRank.filter(c => {
    const searchMatch = 
      `${c.user?.firstName} ${c.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      (c.party || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.candidateNumber || '').toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'ALL' ? true : c.status === statusFilter;
    const electionMatch = electionFilter === 'ALL' ? true : c.election?.id === electionFilter;
    const categoryMatch = categoryFilter === 'ALL' ? true : c.election?.category === categoryFilter;
    const timeMatch = !timeCutoff ? true : new Date(c.createdAt) >= timeCutoff;
    return searchMatch && statusMatch && electionMatch && categoryMatch && timeMatch;
  });

  // 📌 PAGINATION
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCandidates = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/candidates/${id}/status`, { status: 'APPROVED' });
      toast.success('Contestant approved');
      fetchCandidates();
      if (selectedCandidate?.id === id) setSelectedCandidate(prev => ({ ...prev, status: 'APPROVED' }));
    } catch { toast.error('Approval failed'); }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/admin/candidates/${id}/status`, { status: 'REJECTED' });
      toast.success('Contestant rejected');
      fetchCandidates();
      if (selectedCandidate?.id === id) setSelectedCandidate(prev => ({ ...prev, status: 'REJECTED' }));
    } catch { toast.error('Rejection failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contestant permanently?')) return;
    try {
      await api.delete(`/admin/candidates/${id}`);
      toast.success('Contestant deleted');
      fetchCandidates();
      if (selectedCandidate?.id === id) setShowDetailModal(false);
    } catch { toast.error('Delete failed'); }
  };

  const openEditModal = (candidate) => {
    setCandidateToEdit(candidate);
    setEditModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"><Check size={12}/> Approved</span>;
      case 'REJECTED': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"><X size={12}/> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"><UserCheck size={12}/> Pending</span>;
    }
  };

  const openDetailModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailModal(true);
  };

  const totalContestants = candidates.length;
  const approved = candidates.filter(c => c.status === 'APPROVED').length;
  const pending = candidates.filter(c => c.status === 'PENDING').length;
  const rejected = candidates.filter(c => c.status === 'REJECTED').length;

  const tabs = [
    { label: 'All', value: 'ALL', count: totalContestants },
    { label: 'Pending', value: 'PENDING', count: pending },
    { label: 'Approved', value: 'APPROVED', count: approved },
    { label: 'Rejected', value: 'REJECTED', count: rejected },
  ];

  return (
    <div className="p-6 bg-gray-50 text-gray-800 min-h-screen">
      {/* Header: Title + Filters in a single row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">List of Contestants</h2>
          <p className="text-gray-500 text-sm">
            {filtered.length} of {totalContestants} contestant{totalContestants !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-violet-500" />
          </div>
          <select value={electionFilter} onChange={(e) => setElectionFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800">
            <option value="ALL">All Elections</option>
            {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800">
            <option value="ALL">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800">
            <Clock size={16} className="text-violet-500" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white text-gray-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 days</option>
              <option value="LAST_30_DAYS">Last 30 days</option>
              <option value="THIS_YEAR">This year</option>
            </select>
          </div>
          <Button variant="primary" onClick={() => setAddModalOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl">
            <UserPlus size={16} className="mr-1.5" /> Add Contestant
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`pb-3 text-sm font-semibold ${statusFilter === tab.value ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCandidates.map(c => {
          const avatarInitials = c.user?.firstName?.[0] + c.user?.lastName?.[0] || '?';
          return (
            <div key={c.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-5 flex flex-col">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-lg font-bold">{avatarInitials}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {c.user?.firstName} {c.user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{c.user?.email}</div>
                  {c.election && (
                    <div className="text-xs text-violet-600 mt-0.5 truncate">{c.election.title}</div>
                  )}
                </div>
                <div>{getStatusBadge(c.status)}</div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 mb-4 border border-gray-100">
                <FileText size={14} className="text-violet-500 flex-shrink-0" />
                <span>
                  {c.status === 'PENDING' ? 'National ID uploaded — pending review' :
                   c.status === 'APPROVED' ? 'Verified' : 'Rejected'}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>Party: {c.party || 'Independent'}</span>
                <span>#{c.candidateNumber || '—'}</span>
              </div>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => openDetailModal(c)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} /> Review
                </button>
                {c.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(c.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(c.id)}
                      className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <X size={14} /> Reject
                    </button>
                  </>
                )}
                {c.status !== 'PENDING' && (
                  <>
                    <button
                      onClick={() => openEditModal(c)}
                      className="py-2 px-3 rounded-xl border border-amber-200 text-amber-600 hover:bg-amber-50 transition"
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {paginatedCandidates.length === 0 && (
        <div className="text-center py-12 text-gray-500">No contestants found.</div>
      )}

      {/* 📌 PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 text-sm">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowDetailModal(false)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-500 hover:text-gray-800">
              <XCircle size={20}/>
            </button>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                  {selectedCandidate.avatarUrl ? (
                    <img src={selectedCandidate.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {selectedCandidate.user?.firstName?.[0]}{selectedCandidate.user?.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCandidate.user?.firstName} {selectedCandidate.user?.lastName}</h2>
                  <p className="text-gray-500">{selectedCandidate.user?.email}</p>
                  <div className="mt-1">{getStatusBadge(selectedCandidate.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div><p className="text-gray-500 text-xs uppercase tracking-wide">Candidate Number</p><p className="text-gray-900">{selectedCandidate.candidateNumber || '—'}</p></div>
                <div><p className="text-gray-500 text-xs uppercase tracking-wide">Election</p><p className="text-gray-900">{selectedCandidate.election?.title || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs uppercase tracking-wide">Category</p><p className="text-gray-900">{selectedCandidate.election?.category || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-xs uppercase tracking-wide">Party / Organization</p><p className="text-gray-900">{selectedCandidate.party || 'Independent'}</p></div>
                <div><p className="text-gray-500 text-xs uppercase tracking-wide">Slogan</p><p className="text-gray-900 italic">{selectedCandidate.slogan || '—'}</p></div>
                <div className="md:col-span-2"><p className="text-gray-500 text-xs uppercase tracking-wide">Bio</p><p className="text-gray-700 text-sm">{selectedCandidate.bio || 'No bio provided'}</p></div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Campaign Info</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Rank:</span><span className="text-gray-900">#{selectedCandidate.rank || '—'}</span>
                  <span className="text-gray-500">Total Votes:</span><span className="text-gray-900">{selectedCandidate.votesReceived?.toLocaleString()}</span>
                  <span className="text-gray-500">Joined:</span><span className="text-gray-900">{new Date(selectedCandidate.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Voting Summary</h4>
                <div className="flex justify-between"><span className="text-gray-500">Total Votes</span><span className="text-gray-900 font-bold">{selectedCandidate.votesReceived?.toLocaleString()}</span></div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Verification</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2"><Check size={14} className="text-emerald-600"/> ID Document Verified</div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-emerald-600"/> Email Verified</div>
                  <div className="flex items-center gap-2"><X size={14} className="text-gray-400"/> Phone OTP Verified</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end">
                {selectedCandidate.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleApprove(selectedCandidate.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition"><Check size={14} /> Approve</button>
                    <button onClick={() => handleReject(selectedCandidate.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"><X size={14} /> Reject</button>
                  </>
                )}
                <button onClick={() => handleDelete(selectedCandidate.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium transition"><XCircle size={14} /> Delete</button>
                <button onClick={() => openEditModal(selectedCandidate)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 text-amber-600 hover:bg-amber-50 text-sm font-medium transition"><Edit size={14} /> Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AddCandidateModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={fetchCandidates} />

      {/* Edit Modal */}
      <EditCandidateModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setCandidateToEdit(null); }}
        candidate={candidateToEdit}
        onSuccess={() => { fetchCandidates(); setShowDetailModal(false); }}
      />
    </div>
  );
}