import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  Vote,
  BarChart3,
  Flag,
  FileText,
  Edit,
  Trash2,
  Archive,
  ChevronLeft,
  Check,
  X,
  Play,
  StopCircle,
  UserPlus,
  Pencil,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import AddElectionModal from './AddElectionModal';
import AddCandidateModal from './AddCandidateModal';
import EditCandidateModal from './EditCandidateModal';
import { formatADtoBS, formatADtoBSLong } from '../../utils/date';

export default function ElectionDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  if (!id) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold">No election ID provided</div>
        <button
          onClick={() => navigate('/admin/elections')}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700"
        >
          <ChevronLeft size={16} /> Back to Elections
        </button>
      </div>
    );
  }

  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showEditCandidateModal, setShowEditCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ totalVotes: 0, totalCandidates: 0 });

  const fetchElection = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/elections/${id}`);
      const data = res.data.election;
      if (!data) {
        throw new Error('Election data not found in response');
      }
      setElection(data);
      setCandidates(data.candidates || []);
      setStats({
        totalVotes: data.totalVotes || 0,
        totalCandidates: data.candidates?.length || 0,
      });
    } catch (err) {
      console.error('Failed to fetch election:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load election details');
      toast.error('Failed to load election details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElection();
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await api.put(`/elections/${id}`, { status });
      toast.success(`Election ${status.toLowerCase()} successfully`);
      fetchElection();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this election permanently? This action cannot be undone.')) return;
    try {
      await api.delete(`/elections/${id}`);
      toast.success('Election deleted');
      navigate('/admin/elections');
    } catch {
      toast.error('Failed to delete election');
    }
  };

  const handleAddCandidate = () => {
    setShowAddCandidateModal(true);
  };

  const handleEditCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowEditCandidateModal(true);
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Delete this candidate permanently?')) return;
    try {
      await api.delete(`/admin/candidates/${candidateId}`);
      toast.success('Candidate deleted');
      fetchElection();
    } catch {
      toast.error('Failed to delete candidate');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active</span>;
      case 'UPCOMING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"><Clock size={12} /> Upcoming</span>;
      case 'ENDED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"><Check size={12} /> Ended</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'results', label: 'Results', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold">Error loading election</div>
        <p className="text-gray-600 mt-2">{error || 'Election not found'}</p>
        <button
          onClick={() => navigate('/admin/elections')}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700"
        >
          <ChevronLeft size={16} /> Back to Elections
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <button onClick={() => navigate('/admin/elections')} className="hover:text-violet-600 flex items-center gap-1">
          <ChevronLeft size={16} /> Elections
        </button>
        <span>/</span>
        <span className="text-gray-800 font-medium">{election.title}</span>
      </div>

      {/* Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-r from-violet-600 to-blue-600 relative flex items-end p-6">
          <div className="absolute top-4 left-4 flex gap-2">
            {getStatusBadge(election.status)}
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold">{election.title}</h2>
            <p className="text-sm opacity-90">
              {election.organizerName || election.createdBy || 'Unknown organizer'} · {election.category || 'General'}
            </p>
          </div>
        </div>
        <div className="p-4 flex flex-wrap items-center justify-end gap-2 border-t border-gray-200">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm"
          >
            <Edit size={14} /> Edit
          </button>
          {election.status === 'UPCOMING' && (
            <button
              onClick={() => handleStatusChange('ACTIVE')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition"
            >
              <Play size={14} /> Start Election
            </button>
          )}
          {election.status === 'ACTIVE' && (
            <button
              onClick={() => handleStatusChange('ENDED')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm transition"
            >
              <StopCircle size={14} /> End Election
            </button>
          )}
          <button
            onClick={() => handleStatusChange('ARCHIVED')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-sm"
          >
            <Archive size={14} /> Archive
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition text-sm"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total Votes</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalVotes.toLocaleString()}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Vote size={20} className="text-violet-600" />
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Candidates</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users size={20} className="text-blue-600" />
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Ends (BS)</p>
            <h3 className="text-base font-bold text-gray-900">
              {formatADtoBS(election.endDate)}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-cyan-100 flex items-center justify-center">
            <Calendar size={20} className="text-cyan-600" />
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Flags</p>
            <h3 className="text-2xl font-bold text-gray-900">0</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Flag size={20} className="text-amber-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {election.description || 'No description provided.'}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Start Date (BS):</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatADtoBSLong(election.startDate)} ({formatADtoBS(election.startDate)})
                </span>
              </div>
              <div>
                <span className="text-gray-500">End Date (BS):</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatADtoBSLong(election.endDate)} ({formatADtoBS(election.endDate)})
                </span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium text-gray-900">{election.category || 'General'}</span>
              </div>
              <div>
                <span className="text-gray-500">Vote Price:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {election.votePrice === 0 ? 'Free' : `रू ${election.votePrice}`}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Organizer:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {election.organizerName || election.createdBy || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'candidates' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Candidates ({candidates.length})</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddCandidate}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <UserPlus size={14} className="mr-1.5" /> Add Candidate
              </Button>
            </div>
            {candidates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No candidates registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="text-left py-3 px-4">Candidate</th>
                      <th className="text-left py-3 px-4">Party</th>
                      <th className="text-left py-3 px-4">Votes</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                              {c.user?.avatarUrl ? (
                                <img src={c.user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                `${c.user?.firstName?.[0]}${c.user?.lastName?.[0]}`
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {c.user?.firstName} {c.user?.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{c.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{c.party || 'Independent'}</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">{c.votesReceived || 0}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            c.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {c.status === 'APPROVED' ? <Check size={12} /> : <X size={12} />}
                            {c.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditCandidate(c)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCandidate(c.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Results</h3>
            {candidates.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data available.</p>
            ) : (
              <div className="space-y-4">
                {candidates
                  .sort((a, b) => (b.votesReceived || 0) - (a.votesReceived || 0))
                  .map((c, idx) => {
                    const maxVotes = Math.max(...candidates.map(c => c.votesReceived || 0), 1);
                    const pct = Math.round(((c.votesReceived || 0) / maxVotes) * 100);
                    return (
                      <div key={c.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-800">
                            {idx + 1}. {c.user?.firstName} {c.user?.lastName}
                          </span>
                          <span className="text-gray-500">{c.votesReceived || 0} votes</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddElectionModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          fetchElection();
          setShowEditModal(false);
        }}
        election={election}
      />

      <AddCandidateModal
        open={showAddCandidateModal}
        onClose={() => setShowAddCandidateModal(false)}
        onSuccess={() => {
          fetchElection();
          setShowAddCandidateModal(false);
        }}
        electionId={id}
        hideElectionSelect={true}
      />

      <EditCandidateModal
        open={showEditCandidateModal}
        onClose={() => {
          setShowEditCandidateModal(false);
          setSelectedCandidate(null);
        }}
        candidate={selectedCandidate}
        onSuccess={() => {
          fetchElection();
          setShowEditCandidateModal(false);
          setSelectedCandidate(null);
        }}
      />
    </div>
  );
}