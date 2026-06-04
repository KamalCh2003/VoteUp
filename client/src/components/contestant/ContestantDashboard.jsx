import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Vote, BarChart3, Users, Clock, Shield, ArrowRight, PlusCircle,
  TrendingUp, Calendar, RefreshCw, Trophy, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ContestantDashboard() {
  const { user } = useAuth();
  const [candidacy, setCandidacy] = useState(null);
  const [activeElections, setActiveElections] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [competitorsLoading, setCompetitorsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch competitors for the election the candidate is part of
  const fetchCompetitors = async (electionId) => {
    if (!electionId) return;
    setCompetitorsLoading(true);
    try {
      const response = await api.get(`/elections/${electionId}`);
      const electionData = response.data.election;
      const candidatesArray = electionData?.candidates || [];
      // Sort by votes received descending for ranking
      const sorted = [...candidatesArray].sort((a, b) => b.votesReceived - a.votesReceived);
      setCompetitors(sorted);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch competitors:', err);
    } finally {
      setCompetitorsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    Promise.all([
      api.get('/candidates/me'),
      api.get('/elections', { params: { status: 'ACTIVE', limit: 4 } }),
    ])
      .then(([candidacyRes, electionsRes]) => {
        const myCandidacy = candidacyRes.data.candidate;
        setCandidacy(myCandidacy);
        setActiveElections(electionsRes.data.elections || []);
        if (myCandidacy?.election?.id) {
          fetchCompetitors(myCandidacy.election.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Set up periodic refresh for live ranking (every 15 seconds)
  useEffect(() => {
    if (!candidacy?.election?.id) return;
    const interval = setInterval(() => {
      fetchCompetitors(candidacy.election.id);
    }, 15000);
    return () => clearInterval(interval);
  }, [candidacy?.election?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400"></div>
      </div>
    );
  }

  // Helper to get current user's rank
  const getCurrentUserRank = () => {
    const index = competitors.findIndex(c => c.user.id === user?.id);
    return index !== -1 ? index + 1 : null;
  };

  return (
    <div className="mt-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">
              Welcome, {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-gray-400">
              {candidacy ? (
                <>
                  {candidacy.party || 'Independent'} ·{' '}
                  <span className="text-violet-400 font-medium">{candidacy.status}</span>
                </>
              ) : (
                'Contestant account'
              )}
            </p>
          </div>
        </div>
        {!candidacy && (
          <Link
            to="/contestant/apply"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-600 transition"
          >
            <PlusCircle size={16} />
            Apply Now
          </Link>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-violet-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                {candidacy ? 'Total Votes Received' : 'Available Elections'}
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {candidacy ? candidacy.votesReceived.toLocaleString() : activeElections.length}
              </p>
            </div>
            <Vote className="text-violet-400" size={32} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-emerald-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                {candidacy ? 'Total Election Votes' : 'Past Elections'}
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {candidacy ? (candidacy.election?.totalVotes?.toLocaleString() || 0) : '0'}
              </p>
            </div>
            <BarChart3 className="text-emerald-400" size={32} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-cyan-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                {candidacy ? 'Vote Share' : 'Your Status'}
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {candidacy
                  ? candidacy.election?.totalVotes
                    ? ((candidacy.votesReceived / candidacy.election.totalVotes) * 100).toFixed(1) + '%'
                    : '0%'
                  : 'Not Applied'}
              </p>
            </div>
            <Users className="text-cyan-400" size={32} />
          </div>
        </div>
      </div>

      {/* Election Info */}
      {candidacy && (
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">
            Election: {candidacy.election?.title || 'N/A'}
          </h3>
          <p className="text-sm text-gray-400">
            {candidacy.election?.description || 'No description available.'}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Clock size={14} />
            Ends {candidacy.election?.endDate ? new Date(candidacy.election.endDate).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      )}

      {/* LIVE RANKING SECTION */}
      {candidacy && competitors.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={24} />
              <h3 className="text-lg font-semibold text-white">Live Ranking</h3>
              {competitorsLoading && (
                <RefreshCw size={14} className="text-gray-400 animate-spin ml-2" />
              )}
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 font-medium text-gray-400">Rank</th>
                  <th className="pb-3 font-medium text-gray-400">Candidate</th>
                  <th className="pb-3 font-medium text-gray-400">Party/Organization</th>
                  <th className="pb-3 font-medium text-gray-400 text-right">Votes</th>
                  <th className="pb-3 font-medium text-gray-400 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((competitor, idx) => {
                  const isCurrentUser = competitor.user.id === user?.id;
                  const totalVotes = candidacy.election?.totalVotes || 1;
                  const share = (competitor.votesReceived / totalVotes) * 100;
                  return (
                    <tr
                      key={competitor.id}
                      className={`border-b border-white/5 ${
                        isCurrentUser ? 'bg-violet-500/10' : ''
                      }`}
                    >
                      <td className="py-3 font-medium text-white">
                        {idx === 0 && <Trophy size={14} className="inline text-yellow-400 mr-1" />}
                        #{idx + 1}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                            {competitor.user.firstName[0]}{competitor.user.lastName[0]}
                          </div>
                          <div>
                            <p className={`font-medium ${isCurrentUser ? 'text-violet-400' : 'text-white'}`}>
                              {competitor.user.firstName} {competitor.user.lastName}
                              {isCurrentUser && <span className="ml-2 text-xs text-violet-400">(You)</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-300">
                        {competitor.party || 'Independent'}
                      </td>
                      <td className="py-3 text-right font-mono text-white">
                        {competitor.votesReceived.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-gray-300">
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Optional: show current user's rank badge */}
          <div className="mt-4 flex justify-end">
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <UserCheck size={12} />
              Your current rank: <span className="text-white font-bold">#{getCurrentUserRank()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Apply Prompt or Quick Links */}
      {!candidacy ? (
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Shield size={24} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Ready to run?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Apply for an election to start your campaign and appear on the ballot.
              </p>
              <Link
                to="/contestant/apply"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-600 transition"
              >
                Apply for Candidacy <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/contestant/campaign"
            className="rounded-2xl border border-white/10 bg-[#0B1020] p-6 hover:border-violet-500/30 transition flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold text-white">Campaign</h3>
              <p className="text-sm text-gray-400">Manage your manifesto and media</p>
            </div>
            <ArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/contestant/analytics"
            className="rounded-2xl border border-white/10 bg-[#0B1020] p-6 hover:border-violet-500/30 transition flex items-center justify-between group"
          >
            <div>
              <h3 className="text-lg font-semibold text-white">Analytics</h3>
              <p className="text-sm text-gray-400">View detailed vote trends</p>
            </div>
            <ArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}