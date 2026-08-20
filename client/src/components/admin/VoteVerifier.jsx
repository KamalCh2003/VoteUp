import { useState, useEffect, useMemo } from 'react';
import { Search, Trash2, AlertCircle, Filter, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatADtoBSLong } from '../../utils/date';

export default function VoteVerifier() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [electionFilter, setElectionFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const toast = useToast();

  const formatNepaliDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    const bsDate = formatADtoBSLong(date);
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${bsDate}, ${time}`;
  };

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      setError(null);
      const res = await api.get('/admin/votes');
      setVotes(res.data.votes || []);
      if (res.data.votes?.length === 0) {
        setError('No votes have been cast yet.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load votes');
      toast.error('Failed to load votes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (voteId, voterName, candidateName) => {
    if (!window.confirm(`Delete vote from ${voterName} for ${candidateName}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/votes/${voteId}`);
      toast.success('Vote deleted');
      fetchVotes();
    } catch (err) {
      toast.error('Failed to delete vote');
    }
  };

  const elections = useMemo(() => {
    const unique = new Map();
    votes.forEach(v => {
      if (v.election) {
        unique.set(v.election.id || v.election.title, v.election);
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [votes]);

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

  const filtered = votes.filter(v => {
    const searchMatch =
      !search ||
      v.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      `${v.user?.firstName} ${v.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      `${v.candidate?.user?.firstName} ${v.candidate?.user?.lastName}`.toLowerCase().includes(search.toLowerCase());

    const electionMatch =
      electionFilter === 'ALL' || v.election?.id === electionFilter || v.election?.title === electionFilter;

    const timeMatch = !timeCutoff || new Date(v.votedAt) >= timeCutoff;

    return searchMatch && electionMatch && timeMatch;
  });

  const totalVotesSum = votes.reduce((sum, v) => sum + (v.quantity || 1), 0);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedVotes = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, electionFilter, timeFilter]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (error && votes.length === 0) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={fetchVotes}
          className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm hover:bg-violet-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Vote Verifier</h2>
          <p className="text-gray-500 text-sm">Inspect and manage every vote</p>
          {votes.length > 0 && (
            <p className="text-xs text-emerald-600 mt-1">Total votes: {totalVotesSum}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by voter or candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 min-w-[180px]">
            <Filter size={16} className="text-violet-500 flex-shrink-0" />
            <select
              value={electionFilter}
              onChange={(e) => setElectionFilter(e.target.value)}
              className="bg-white outline-none cursor-pointer w-full"
            >
              <option value="ALL">All Elections</option>
              {elections.map(e => (
                <option key={e.id || e.title} value={e.id || e.title}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 min-w-[160px]">
            <Clock size={16} className="text-violet-500 flex-shrink-0" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white outline-none cursor-pointer w-full"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 days</option>
              <option value="LAST_30_DAYS">Last 30 days</option>
              <option value="THIS_YEAR">This year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <tr>
                <th className="p-4">Voter</th>
                <th className="p-4">Email</th>
                <th className="p-4">Voted For</th>
                <th className="p-4">Election</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Voted At (BS)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedVotes.map(vote => (
                <tr key={vote.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{vote.user?.firstName} {vote.user?.lastName}</td>
                  <td className="p-4 text-gray-600">{vote.user?.email}</td>
                  <td className="p-4 text-gray-900">{vote.candidate?.user?.firstName} {vote.candidate?.user?.lastName}</td>
                  <td className="p-4 text-gray-600">{vote.election?.title}</td>
                  <td className="p-4 text-gray-700">{vote.quantity ?? 1}</td>
                  <td className="p-4 text-gray-500">{formatNepaliDate(vote.votedAt)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(vote.id, `${vote.user?.firstName} ${vote.user?.lastName}`, `${vote.candidate?.user?.firstName} ${vote.candidate?.user?.lastName}`)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                      title="Delete vote"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedVotes.length === 0 && votes.length > 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No matching votes found.
                  </td>
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
    </div>
  );
}