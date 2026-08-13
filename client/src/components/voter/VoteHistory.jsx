import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Loader2,
  Calendar,
  User,
  Hash,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function VoteHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null); // track which item is expanded

  useEffect(() => {
    fetchVoteHistory();
  }, []);

  const fetchVoteHistory = async () => {
    try {
      const { data } = await api.get('/users/me/votes');
      setHistory(data.votes || []);
      setError(null);
    } catch (err) {
      setError('Could not load your voting history.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getVoteType = (votePrice) => (votePrice === 0 ? 'Free' : 'Paid');

  const calculateSpend = (votePrice, quantity) =>
    votePrice === 0 ? '—' : `रू ${(votePrice * quantity).toLocaleString()}`;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchVoteHistory}
          className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No voting history found</p>
        <a href="/elections" className="text-blue-600 hover:underline mt-2 inline-block">
          Explore elections →
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Voting History</h1>
        <p className="text-gray-500 mt-1">Track all your votes across elections</p>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="text-left p-4">Election</th>
              <th className="text-left p-4">Candidate</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Qty</th>
              <th className="text-left p-4">Spend</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((vote) => {
              const votePrice = vote.election?.votePrice ?? 0;
              const spend = calculateSpend(votePrice, vote.quantity);
              const voteType = getVoteType(votePrice);

              const name =
                `${vote.candidate?.user?.firstName || ''} ${vote.candidate?.user?.lastName || ''}`.trim() ||
                'Unknown';

              return (
                <tr key={vote.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{vote.election?.title}</td>
                  <td className="p-4 flex items-center gap-2">
                    {vote.candidate?.avatarUrl ? (
                      <img
                        src={vote.candidate.avatarUrl}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-gray-400" />
                    )}
                    <span className="text-gray-700">{name}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        voteType === 'Free'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {voteType}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">{vote.quantity || 1}</td>
                  <td className="p-4 font-mono text-gray-800">{spend}</td>
                  <td className="p-4 text-gray-500">{formatDate(vote.votedAt)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      Counted
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE DROPDOWN CARDS */}
      <div className="md:hidden space-y-3">
        {history.map((vote) => {
          const votePrice = vote.election?.votePrice ?? 0;
          const spend = calculateSpend(votePrice, vote.quantity);
          const voteType = getVoteType(votePrice);

          const name =
            `${vote.candidate?.user?.firstName || ''} ${vote.candidate?.user?.lastName || ''}`.trim() ||
            'Unknown';

          const isExpanded = expandedId === vote.id;

          return (
            <div
              key={vote.id}
              className="bg-white border rounded-xl shadow-sm overflow-hidden"
            >
              {/* Header – always visible, click to toggle */}
              <button
                onClick={() => toggleExpand(vote.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-semibold text-gray-900 truncate">
                    {vote.election?.title}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                    Counted
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      voteType === 'Free'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {voteType}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-2 text-sm border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-gray-700">{name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-gray-400" />
                    <span className="text-gray-600">{voteType} Vote</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-gray-400" />
                    <span className="text-gray-700">Qty: {vote.quantity || 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-gray-400" />
                    <span className="text-gray-700">Spend: {spend}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-500">{formatDate(vote.votedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}