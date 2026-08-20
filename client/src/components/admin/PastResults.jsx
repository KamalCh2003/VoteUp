import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Trophy,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  AlertCircle,
  CircleCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatADtoBSLong } from '../../utils/date';

export default function PastResults() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishing, setPublishing] = useState(null);
  const toast = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEndedElections();
  }, []);

  const fetchEndedElections = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/elections', {
        params: { status: 'ENDED', includeDetails: true },
      });
      const ended = res.data.elections || [];
      ended.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
      setElections(ended);
    } catch (err) {
      console.error('Failed to fetch ended elections:', err);
      setError('Could not load past elections.');
      toast.error('Failed to load past elections');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (electionId) => {
    if (!window.confirm('Publish results for this election? Voters will then be able to see the results.')) return;
    setPublishing(electionId);
    try {
      await api.patch(`/elections/${electionId}/publish`);
      toast.success('Results published successfully');
      fetchEndedElections();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish results');
    } finally {
      setPublishing(null);
    }
  };

  const totalItems = elections.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentElections = elections.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [elections.length]);

  const getWinner = (election) => {
    if (!election.candidates || election.candidates.length === 0) return '—';
    const sorted = [...election.candidates].sort(
      (a, b) => (b.votesReceived || 0) - (a.votesReceived || 0)
    );
    const top = sorted[0];
    if (!top) return '—';
    return `${top.user?.firstName || ''} ${top.user?.lastName || ''}`.trim() || 'Unknown';
  };

  const getTotalVotes = (election) => {
    if (!election.candidates) return 0;
    return election.candidates.reduce((sum, c) => sum + (c.votesReceived || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-purple-100" />
            <Loader2 className="absolute inset-0 m-auto animate-spin text-purple-600" size={30} />
          </div>
          <p className="text-sm font-medium text-gray-500">Loading past elections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchEndedElections}
          className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm hover:bg-violet-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (elections.length === 0) {
    return (
      <div className="text-center py-20">
        <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg font-medium">No past elections yet</p>
        <p className="text-gray-400 text-sm">Completed elections will appear here once they end.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy size={24} className="text-violet-600" />
            Past Election Results
          </h2>
          <p className="text-gray-500 text-sm">
            View detailed results of all completed elections.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {totalItems} election{totalItems !== 1 ? 's' : ''} found
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <tr>
                <th className="p-4">Election</th>
                <th className="p-4">End Date (BS)</th>
                <th className="p-4">Total Votes</th>
                <th className="p-4">Winner</th>
                <th className="p-4 text-center">Publish</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentElections.map((election) => {
                const totalVotes = getTotalVotes(election);
                const winner = getWinner(election);
                const isPublished = !!election.resultsPublishedAt;
                return (
                  <tr key={election.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">
                      {election.title}
                      {election.category && (
                        <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {election.category}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatADtoBSLong(election.endDate)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <BarChart3 size={14} className="text-violet-500" />
                        {totalVotes.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {winner !== '—' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                          <Trophy size={12} />
                          {winner}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                          <CircleCheck size={12} /> Published
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePublish(election.id)}
                          disabled={publishing === election.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition disabled:opacity-50"
                        >
                          {publishing === election.id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                          Publish
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/leaderboard?election=${election.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition text-sm font-medium"
                      >
                        <Eye size={15} />
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}–{endIndex} of {totalItems} elections
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      currentPage === page
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}