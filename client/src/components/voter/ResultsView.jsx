// src/pages/ResultsPage.jsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Trophy, Calendar, Clock, RefreshCw, Search } from 'lucide-react';
import api from '../../services/api';

export default function ResultsPage() {
  const [activeElections, setActiveElections] = useState([]);
  const [endedElections, setEndedElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeLeft, setTimeLeft] = useState({});

  // Helper functions
  const getTimeRemaining = useCallback((endDate) => {
    const total = Date.parse(endDate) - Date.now();
    if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { total, days, hours, minutes, seconds };
  }, []);

  const formatCountdown = useCallback((time) => {
    if (time.total <= 0) return 'Ended';
    const parts = [];
    if (time.days > 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);
    parts.push(`${time.seconds}s`);
    return parts.join(' ');
  }, []);

  // Fetch all elections (active and ended)
  const fetchAllElections = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, endedRes] = await Promise.all([
        api.get('/elections', { params: { status: 'ACTIVE' } }),
        api.get('/elections', { params: { status: 'ENDED' } })
      ]);
      let active = activeRes.data.elections || [];
      let ended = endedRes.data.elections || [];

      // Sort active by startDate descending (newest first)
      active.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      // Sort ended by endDate descending (most recent first)
      ended.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

      setActiveElections(active);
      setEndedElections(ended);
      setLastUpdated(new Date());

      // Determine initial selection
      let defaultElectionId = null;
      if (active.length > 0) {
        defaultElectionId = active[0].id;
      } else if (ended.length > 0) {
        defaultElectionId = ended[0].id;
      }

      if (defaultElectionId) {
        // Fetch details for the default selection
        const { data } = await api.get(`/elections/${defaultElectionId}`);
        const election = data.election;
        const sorted = [...(election.candidates || [])].sort((a, b) => b.votesReceived - a.votesReceived);
        setSelectedElection(election);
        setSelectedCandidates(sorted);
      } else {
        setSelectedElection(null);
        setSelectedCandidates([]);
      }

      // Initialize countdown timers for active elections
      const initialTime = {};
      active.forEach(e => {
        initialTime[e.id] = getTimeRemaining(e.endDate);
      });
      setTimeLeft(initialTime);
    } catch (err) {
      console.error('Failed to fetch elections:', err);
    } finally {
      setLoading(false);
    }
  }, [getTimeRemaining]);

  // Fetch active election data periodically (every 30 seconds)
  useEffect(() => {
    fetchAllElections();
    const interval = setInterval(fetchAllElections, 30000);
    return () => clearInterval(interval);
  }, [fetchAllElections]);

  // Update countdown every second for active elections
  useEffect(() => {
    if (!activeElections.length) return;
    const interval = setInterval(() => {
      const updated = {};
      activeElections.forEach(e => {
        updated[e.id] = getTimeRemaining(e.endDate);
      });
      setTimeLeft(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeElections, getTimeRemaining]);

  // Handle selecting an election (click on sidebar)
  const handleSelectElection = useCallback(async (electionId) => {
    // If it's already selected, avoid re-fetching
    if (selectedElection?.id === electionId) return;
    try {
      const { data } = await api.get(`/elections/${electionId}`);
      const election = data.election;
      const sorted = [...(election.candidates || [])].sort((a, b) => b.votesReceived - a.votesReceived);
      setSelectedElection(election);
      setSelectedCandidates(sorted);
    } catch (err) {
      console.error(err);
    }
  }, [selectedElection]);

  // Filter ended elections based on search
  const filteredEnded = useMemo(() => {
    return endedElections.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [endedElections, searchTerm]);

  // Render sidebar election item
  const ElectionItem = ({ election, type }) => {
    const remaining = timeLeft[election.id] || { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const isActive = type === 'active';
    const isSelected = selectedElection?.id === election.id;

    return (
      <div
        onClick={() => handleSelectElection(election.id)}
        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'bg-violet-500/20 border border-violet-500/30'
            : 'bg-white/5 border border-white/10 hover:bg-white/10'
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-white">{election.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{election.category}</p>
          </div>
          {isActive ? (
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE
            </div>
          ) : (
            election.winner && (
              <div className="text-xs text-yellow-400 flex items-center gap-1">
                <Trophy size={12} />
                <span>{election.winner.length > 15 ? election.winner.slice(0, 12) + '…' : election.winner}</span>
              </div>
            )
          )}
        </div>
        {isActive && remaining.total > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400">
            <Clock size={12} />
            <span className="font-mono">{formatCountdown(remaining)}</span>
          </div>
        )}
      </div>
    );
  };

  // Loading skeleton
  if (loading && !selectedElection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDEBAR */}
          <div className="lg:w-1/3 space-y-8">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
              </div>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search past elections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Ongoing Elections
              </h2>
              {activeElections.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                  No ongoing elections.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeElections.map((election) => (
                    <ElectionItem key={election.id} election={election} type="active" />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy size={18} /> Past Elections
              </h2>
              {filteredEnded.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white/5 rounded-xl border border-white/10">
                  {searchTerm ? 'No matching past elections.' : 'No past elections yet.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEnded.map((election) => (
                    <ElectionItem key={election.id} election={election} type="ended" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Detailed ranking */}
          <div className="lg:w-2/3">
            {!selectedElection ? (
              <div className="flex items-center justify-center h-64 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-center text-gray-400">
                  <Trophy size={40} className="mx-auto mb-3 opacity-50" />
                  <p>Select an election from the sidebar to view results</p>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden transition-all">
                <div className="p-5 border-b border-white/10 bg-white/5">
                  <h2 className="text-2xl font-bold text-white">{selectedElection.title}</h2>
                  <p className="text-gray-400 text-sm mt-1">{selectedElection.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(selectedElection.startDate).toLocaleDateString()} – {new Date(selectedElection.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy size={14} />
                      {selectedElection.status === 'ACTIVE' ? 'Ongoing' : 'Ended'}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                      <tr>
                        <th className="p-4 text-left">Rank</th>
                        <th className="p-4 text-left">Candidate</th>
                        <th className="p-4 text-left">Party</th>
                        <th className="p-4 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedCandidates.map((candidate, idx) => {
                        const totalVotes = selectedElection.totalVotes || 1;
                        const share = ((candidate.votesReceived / totalVotes) * 100).toFixed(1);
                        const avatarUrl = candidate.avatarUrl;
                        return (
                          <tr key={candidate.id} className="transition-none">
                            <td className="p-4 font-bold text-white">
                              {idx === 0 && <Trophy size={14} className="inline text-yellow-400 mr-1" />}
                              #{idx + 1}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                                  {avatarUrl ? (
                                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-white text-xs font-bold">
                                      {candidate.user?.firstName?.[0]}{candidate.user?.lastName?.[0]}
                                    </span>
                                  )}
                                </div>
                                <span className="text-white">
                                  {candidate.user?.firstName} {candidate.user?.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-gray-300">{candidate.party || 'Independent'}</td>
                            <td className="p-4 text-right text-gray-300">{share}%</td>
                          </tr>
                        );
                      })}
                      {selectedCandidates.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-gray-500">No candidates registered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-white/10 text-right text-xs text-gray-400">
                  Total candidates: {selectedCandidates.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}