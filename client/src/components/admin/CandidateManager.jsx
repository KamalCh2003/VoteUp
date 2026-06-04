import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Search, Plus, Check, X, Pencil, Trash2, UserCheck,
  Mail, Phone, MapPin, Calendar, PartyPopper, Quote, FileText, XCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import AddCandidateModal from './AddCandidateModal';

export default function CandidateManager() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);   // for detail modal
  const toast = useToast();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data } = await api.get('/admin/candidates');
      setCandidates(data.candidates || []);
    } catch {
      toast.error('Failed to load candidates');
    }
  };

  const filtered = candidates.filter((c) => {
    const name = `${c.user?.firstName} ${c.user?.lastName}`.toLowerCase();
    const party = (c.party || '').toLowerCase();
    const election = (c.election?.title || '').toLowerCase();
    const term = search.toLowerCase();
    return name.includes(term) || party.includes(term) || election.includes(term);
  });

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/candidates/${id}`, { status: 'APPROVED' });
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'APPROVED' } : c))
      );
      if (selectedCandidate?.id === id) {
        setSelectedCandidate((prev) => ({ ...prev, status: 'APPROVED' }));
      }
      toast.success('Candidate approved');
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/candidates/${id}`, { status: 'REJECTED' });
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'REJECTED' } : c))
      );
      if (selectedCandidate?.id === id) {
        setSelectedCandidate((prev) => ({ ...prev, status: 'REJECTED' }));
      }
      toast.success('Candidate rejected');
    } catch {
      toast.error('Rejection failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      // You can add a DELETE endpoint later
      await api.delete(`/admin/candidates/${id}`);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      if (selectedCandidate?.id === id) setSelectedCandidate(null);
      toast.success('Candidate deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Check size={12} /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
            <X size={12} /> Rejected
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <UserCheck size={12} /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300 border border-gray-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Candidate Management</h2>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
          >
            <Plus size={16} />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="text-left py-4 px-6 font-medium text-gray-400">Candidate</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Party</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Election</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Status</th>
                <th className="text-right py-4 px-6 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCandidate(c)}
                  className="hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {c.user?.firstName?.[0]}{c.user?.lastName?.[0]}
                      </div>
                      <span className="font-medium text-white">
                        {c.user?.firstName} {c.user?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-300">{c.party || 'Independent'}</td>
                  <td className="py-4 px-6 text-gray-300">{c.election?.title || 'N/A'}</td>
                  <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                    {getStatusBadge(c.status)}
                  </td>
                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {c.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(c.id)}
                            className="p-2 rounded-xl hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(c.id)}
                            className="p-2 rounded-xl hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
                        title="View Details"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Candidate Modal */}
      <AddCandidateModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchCandidates}
      />

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0B1020] border border-white/10 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white"
            >
              <XCircle size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {selectedCandidate.user?.firstName?.[0]}{selectedCandidate.user?.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedCandidate.user?.firstName} {selectedCandidate.user?.lastName}
                </h2>
                <p className="text-sm text-gray-400">{selectedCandidate.party || 'Independent'}</p>
              </div>
            </div>

            {/* Candidate details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-300">{selectedCandidate.user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-300">
                  Election: {selectedCandidate.election?.title || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Quote size={16} className="text-gray-400" />
                <span className="text-gray-300">{selectedCandidate.slogan || 'No slogan'}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <FileText size={16} className="text-gray-400 mt-1" />
                <p className="text-gray-300">{selectedCandidate.bio || 'No bio provided'}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {selectedCandidate.status === 'PENDING' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(selectedCandidate.id)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check size={16} /> Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(selectedCandidate.id)}
                    className="flex items-center gap-2"
                  >
                    <X size={16} /> Reject
                  </Button>
                </>
              )}
              <Button
                variant="secondary"
                onClick={() => handleDelete(selectedCandidate.id)}
                className="flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10"
              >
                <Trash2 size={16} /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}