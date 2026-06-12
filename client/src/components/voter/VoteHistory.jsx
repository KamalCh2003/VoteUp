import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../common/GlassCard';
import Badge from '../common/Badge';
import { Loader2, Calendar, User, Hash, DollarSign, TrendingUp } from 'lucide-react';

export default function VoteHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVoteHistory();
  }, []);

  const fetchVoteHistory = async () => {
    try {
      const { data } = await api.get('/users/me/votes');
      setHistory(data.votes || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch vote history:', err);
      setError('Could not load your voting history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-violet-400" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchVoteHistory}
          className="mt-4 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">You haven't voted in any election yet.</p>
        <a href="/elections" className="text-violet-400 hover:underline mt-2 inline-block">
          Browse elections →
        </a>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVoteType = (votePrice) => {
    return votePrice === 0 ? 'Free' : 'Paid';
  };

  const calculateSpend = (votePrice, quantity) => {
    if (votePrice === 0) return '—';
    return `रू ${(votePrice * quantity).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Voting History</h1>
        <p className="text-gray-400 text-sm sm:text-base mt-1">
          All your past votes across elections
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="py-4 px-6 text-gray-400">Election</th>
              <th className="py-4 px-6 text-gray-400">Candidate</th>
              <th className="py-4 px-6 text-gray-400">Vote Type</th>
              <th className="py-4 px-6 text-gray-400">Quantity</th>
              <th className="py-4 px-6 text-gray-400">Spend</th>
              <th className="py-4 px-6 text-gray-400">Voted At</th>
              <th className="py-4 px-6 text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((vote) => {
              const votePrice = vote.election?.votePrice ?? 0;
              const spend = calculateSpend(votePrice, vote.quantity);
              const voteType = getVoteType(votePrice);
              const candidateAvatar = vote.candidate?.avatarUrl;
              const candidateName = `${vote.candidate?.user?.firstName || ''} ${vote.candidate?.user?.lastName || ''}`.trim() || 'N/A';
              return (
                <tr key={vote.id} className="hover:bg-white/5 transition">
                  <td className="py-4 px-6 font-medium text-white">
                    {vote.election?.title || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-gray-300">
                    <div className="flex items-center gap-2">
                      {candidateAvatar && (
                        <img
                          src={candidateAvatar}
                          alt="avatar"
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      )}
                      <span>{candidateName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge color={voteType === 'Free' ? '#10B981' : '#F59E0B'} bg="bg-opacity-20">
                      {voteType}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-white">{vote.quantity || 1}</td>
                  <td className="py-4 px-6 text-white font-mono">{spend}</td>
                  <td className="py-4 px-6 text-gray-300">{formatDate(vote.votedAt)}</td>
                  <td className="py-4 px-6">
                    <Badge color="var(--a2)" bg="var(--a2bg)">Counted</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4">
        {history.map((vote) => {
          const votePrice = vote.election?.votePrice ?? 0;
          const spend = calculateSpend(votePrice, vote.quantity);
          const voteType = getVoteType(votePrice);
          const candidateAvatar = vote.candidate?.avatarUrl;
          const candidateName = `${vote.candidate?.user?.firstName || ''} ${vote.candidate?.user?.lastName || ''}`.trim() || 'N/A';
          return (
            <GlassCard key={vote.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold">{vote.election?.title || 'Election'}</h3>
                <Badge color="var(--a2)" bg="var(--a2bg)">Counted</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {candidateAvatar ? (
                    <img
                      src={candidateAvatar}
                      alt="avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-gray-400" />
                  )}
                  <span className="text-gray-300">{candidateName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-gray-400" />
                  <span className="text-gray-300">Type: {voteType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gray-400" />
                  <span className="text-white">Qty: {vote.quantity || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-gray-400" />
                  <span className="text-white">Spend: {spend}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-gray-300">{formatDate(vote.votedAt)}</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}