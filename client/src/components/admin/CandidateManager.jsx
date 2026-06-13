import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import {
  Search, Check, X, UserCheck, Mail, Calendar, PartyPopper, Quote, FileText,
  XCircle, Users, UserCog, UserMinus, Eye, Edit, ChevronLeft, ChevronRight, Trash2
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
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const toast = useToast();

  useEffect(() => {
    fetchCandidates();
    fetchElections();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data } = await api.get('/admin/candidates');
      setCandidates(data.candidates || []);
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

  const filtered = candidatesWithRank.filter(c => {
    const searchMatch = 
      `${c.user?.firstName} ${c.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      (c.party || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.candidateNumber || '').toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'ALL' ? true : c.status === statusFilter;
    const electionMatch = electionFilter === 'ALL' ? true : c.election?.id === electionFilter;
    const categoryMatch = categoryFilter === 'ALL' ? true : c.election?.category === categoryFilter;
    return searchMatch && statusMatch && electionMatch && categoryMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedCandidates = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  const totalContestants = candidates.length;
  const approved = candidates.filter(c => c.status === 'APPROVED').length;
  const pending = candidates.filter(c => c.status === 'PENDING').length;
  const rejected = candidates.filter(c => c.status === 'REJECTED').length;

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
      case 'APPROVED': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200"><Check size={12}/> Approved</span>;
      case 'REJECTED': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><X size={12}/> Rejected</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"><UserCheck size={12}/> Pending</span>;
    }
  };

  const openDetailModal = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 text-gray-800 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Total Contestants</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{totalContestants}</h3></div>
            <Users className="text-violet-500" size={28} />
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Approved</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{approved}</h3></div>
            <UserCheck className="text-emerald-500" size={28} />
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Pending Review</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{pending}</h3></div>
            <UserCog className="text-amber-500" size={28} />
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-sm">Rejected</p><h3 className="text-3xl font-bold text-gray-900 mt-2">{rejected}</h3></div>
            <UserMinus className="text-red-500" size={28} />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-6">
        <div className="relative w-full lg:w-60">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search contestants..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-violet-500" />
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800">
            <option value="ALL">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select value={electionFilter} onChange={(e) => setElectionFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800">
            <option value="ALL">All Elections</option>
            {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800">
            <option value="ALL">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <Button variant="primary" onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white">+ Add Contestant</Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <tr>
                <th className="p-4">Avatar</th>
                <th className="p-4">Contestant</th>
                <th className="p-4">Candidate No.</th>
                <th className="p-4">Election</th>
                <th className="p-4">Party</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCandidates.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 cursor-pointer transition" onClick={() => openDetailModal(c)}>
                  <td className="p-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">{c.user?.firstName?.[0]}{c.user?.lastName?.[0]}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-900">{c.user?.firstName} {c.user?.lastName}</div>
                      <div className="text-xs text-gray-500">{c.user?.email}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{c.candidateNumber || '—'} </td>
                  <td className="p-4 text-gray-600">{c.election?.title || '—'} </td>
                  <td className="p-4 text-gray-600">{c.party || 'Independent'} </td>
                  <td className="p-4 text-gray-600">{c.election?.category || '—'} </td>
                  <td className="p-4">{getStatusBadge(c.status)}</td>
                  <td className="p-4 text-right space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {c.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleApprove(c.id)} className="p-1.5 rounded-lg hover:bg-emerald-100 text-gray-500 hover:text-emerald-600 transition"><Check size={16}/></button>
                        <button onClick={() => handleReject(c.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition"><X size={16}/></button>
                      </>
                    )}
                    <button onClick={() => openDetailModal(c)} className="py-1.5 px-1 rounded-lg hover:bg-gray-100 transition text-gray-500"><Eye size={16}/></button>
                    <button onClick={() => openEditModal(c)} className="py-1.5 px-1 rounded-lg hover:bg-amber-100 text-gray-500 hover:text-amber-600 transition"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(c.id)} className="py-1.5 px-1 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition"><XCircle size={16}/></button>
                  </td>
                </tr>
              ))}
              {paginatedCandidates.length === 0 && (
                <td colSpan={8} className="text-center py-12 text-gray-500">No contestants found.</td>
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

      {/* Detail Modal - light theme */}
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
                    <button
                      onClick={() => handleApprove(selectedCandidate.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedCandidate.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
                    >
                      <Trash2 size={14} /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(selectedCandidate.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium transition"
                >
                  <XCircle size={14} /> Delete
                </button>
                <button
                  onClick={() => openEditModal(selectedCandidate)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 text-amber-600 hover:bg-amber-50 text-sm font-medium transition"
                >
                  <Edit size={14} /> Edit
                </button>
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
        onClose={() => {
          setEditModalOpen(false);
          setCandidateToEdit(null);
        }}
        candidate={candidateToEdit}
        onSuccess={() => {
          fetchCandidates();
          setShowDetailModal(false);
        }}
      />
    </div>
  );
}