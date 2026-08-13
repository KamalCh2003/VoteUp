// src/pages/ResultsPage.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Trophy, Calendar, Search, RefreshCw, Clock, Crown } from 'lucide-react';
import api from '../../services/api';

export default function ResultsPage() {
  const [activeElections, setActiveElections] = useState([]);
  const [endedElections, setEndedElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const hasInitialized = useRef(false);

  // ─── Fetch election list ──────────────────────────────────────────────
  const fetchAllElections = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, endedRes] = await Promise.all([
        api.get('/elections', { params: { status: 'ACTIVE' } }),
        api.get('/elections', { params: { status: 'ENDED' } }),
      ]);

      let active = activeRes.data.elections || [];
      let ended = endedRes.data.elections || [];

      active.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      ended.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

      setActiveElections(active);
      setEndedElections(ended);
      setLastUpdated(new Date());

      if (!hasInitialized.current) {
        hasInitialized.current = true;
        let electionToSelect = null;
        // Prefer ended elections, else pick first active
        if (ended.length > 0) electionToSelect = ended[0];
        else if (active.length > 0) electionToSelect = active[0];

        if (electionToSelect) {
          const { data } = await api.get(`/elections/${electionToSelect.id}`);
          const election = data.election;
          const sorted = [...(election.candidates || [])].sort(
            (a, b) => b.votesReceived - a.votesReceived
          );
          setSelectedElection(election);
          setSelectedCandidates(sorted);
        } else {
          setSelectedElection(null);
          setSelectedCandidates([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch elections:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Fetch a single election (only for ended ones) ──────────────────
  const fetchSelectedElection = useCallback(async () => {
    if (!selectedElection) return;
    // Only fetch details if the election is ended
    if (selectedElection.status !== 'ENDED') return;
    try {
      setRefreshing(true);
      const { data } = await api.get(`/elections/${selectedElection.id}`);
      const election = data.election;
      const sorted = [...(election.candidates || [])].sort(
        (a, b) => b.votesReceived - a.votesReceived
      );
      setSelectedElection(election);
      setSelectedCandidates(sorted);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to refresh election:', err);
    } finally {
      setRefreshing(false);
    }
  }, [selectedElection?.id, selectedElection?.status]);

  // ─── Effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchAllElections();
    const listInterval = setInterval(fetchAllElections, 30000);
    return () => clearInterval(listInterval);
  }, [fetchAllElections]);

  // Poll only if selected election is ENDED
  useEffect(() => {
    if (!selectedElection) return;
    // If active, we don't fetch details (no results to show)
    if (selectedElection.status !== 'ENDED') {
      // We still want to show the election info, but no leaderboard
      // and no polling.
      return;
    }

    // Initial fetch for ended election
    fetchSelectedElection();

    // Refresh every 30 seconds (though votes won't change, good for safety)
    const pollInterval = setInterval(fetchSelectedElection, 30000);
    return () => clearInterval(pollInterval);
  }, [selectedElection?.id, selectedElection?.status, fetchSelectedElection]);

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleSelectElection = useCallback(
    async (electionId) => {
      if (selectedElection?.id === electionId) return;
      try {
        const { data } = await api.get(`/elections/${electionId}`);
        const election = data.election;
        const sorted = [...(election.candidates || [])].sort(
          (a, b) => b.votesReceived - a.votesReceived
        );
        setSelectedElection(election);
        setSelectedCandidates(sorted);
      } catch (err) {
        console.error(err);
      }
    },
    [selectedElection]
  );

  // ─── Filters ────────────────────────────────────────────────────────

  const filteredEnded = useMemo(() => {
    return endedElections.filter((e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [endedElections, searchTerm]);

  const filteredActive = useMemo(() => {
    return activeElections.filter((e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeElections, searchTerm]);

  // ─── Election Item ──────────────────────────────────────────────────

  const ElectionItem = ({ election, type }) => {
    const isSelected = selectedElection?.id === election.id;
    const isActive = type === 'active';

    return (
      <div
        onClick={() => handleSelectElection(election.id)}
        className={`p-4 rounded-xl cursor-pointer transition border ${
          isSelected
            ? 'bg-blue-50 border-blue-300'
            : 'bg-white hover:bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900">{election.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{election.category}</p>
          </div>
          {isActive ? (
            <div className="text-xs text-green-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              LIVE
            </div>
          ) : (
            election.winner && (
              <div className="text-xs text-yellow-600 flex items-center gap-1">
                <Trophy size={12} />
                <span>{election.winner}</span>
              </div>
            )
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <Calendar size={12} />
          <span>
            {isActive
              ? `Ends ${new Date(election.endDate).toLocaleDateString()}`
              : `Ended ${new Date(election.endDate).toLocaleDateString()}`}
          </span>
        </div>
      </div>
    );
  };

  // ─── Leaderboard Renderer ──────────────────────────────────────────

  const renderLeaderboard = () => {
    if (!selectedElection) {
      return (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
          Select an election to view results.
        </div>
      );
    }

    // For active elections, show "coming soon" message
    if (selectedElection.status === 'ACTIVE') {
      return (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b bg-blue-50">
            <h2 className="text-xl font-bold">{selectedElection.title}</h2>
            <p className="text-sm text-gray-500">{selectedElection.description}</p>
            <div className="flex gap-4 text-xs text-gray-500 mt-2">
              <span>
                <Calendar size={12} className="inline mr-1" />
                Ends: {new Date(selectedElection.endDate).toLocaleDateString()}
              </span>
              <span className="text-blue-600 font-medium">LIVE</span>
            </div>
          </div>
          <div className="p-10 text-center text-gray-500">
            <Clock size={48} className="mx-auto mb-3 text-blue-400" />
            <p className="text-lg font-medium">Results not yet available</p>
            <p className="text-sm">Results will be published after the election ends.</p>
          </div>
        </div>
      );
    }

    // For ended elections, show full leaderboard
    const totalVotes = selectedCandidates.reduce((sum, c) => sum + (c.votesReceived || 0), 0);
    const maxVotes = selectedCandidates.length > 0 ? Math.max(...selectedCandidates.map(c => c.votesReceived || 0)) : 1;

    return (
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b bg-gray-50">
          <h2 className="text-xl font-bold">{selectedElection.title}</h2>
          <p className="text-sm text-gray-500">{selectedElection.description}</p>
          <div className="flex gap-4 text-xs text-gray-500 mt-2">
            <span>
              <Calendar size={12} className="inline mr-1" />
              Ended: {new Date(selectedElection.endDate).toLocaleDateString()}
            </span>
            <span>Total votes: {totalVotes.toLocaleString()}</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {selectedCandidates.map((candidate, index) => {
            const rank = index + 1;
            const voteCount = candidate.votesReceived || 0;
            const widthPercent = maxVotes > 0 ? (voteCount / maxVotes) * 100 : 0;

            let rankBadge;
            if (rank === 1) {
              rankBadge = (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold shadow-md">
                  <Crown size={18} />
                </div>
              );
            } else if (rank === 2) {
              rankBadge = (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-white font-bold shadow-md">
                  2
                </div>
              );
            } else if (rank === 3) {
              rankBadge = (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold shadow-md">
                  3
                </div>
              );
            } else {
              rankBadge = (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 font-bold">
                  {rank}
                </div>
              );
            }

            return (
              <div key={candidate.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                <div className="flex-shrink-0">{rankBadge}</div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {candidate.avatarUrl ? (
                    <img src={candidate.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {candidate.user?.firstName?.[0] || ''}{candidate.user?.lastName?.[0] || ''}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {candidate.user?.firstName} {candidate.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{candidate.party || 'Independent'}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:block w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-medium text-gray-700 min-w-[60px] text-right">
                    {voteCount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
          {selectedCandidates.length === 0 && (
            <div className="p-10 text-center text-gray-400">No candidates found</div>
          )}
        </div>
      </div>
    );
  };

  // ─── Loading state ──────────────────────────────────────────────────

  if (loading && !selectedElection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {lastUpdated?.toLocaleTimeString() || '--:--'}
          </div>
        </div>

        {/* Main layout – stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar – election list */}
          <div className="lg:w-1/3 space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Search elections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredActive.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  Ongoing
                </h3>
                <div className="space-y-3">
                  {filteredActive.map((e) => (
                    <ElectionItem key={e.id} election={e} type="active" />
                  ))}
                </div>
              </div>
            )}

            {filteredEnded.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-2 flex items-center gap-2">
                  <Trophy size={14} /> Past
                </h3>
                <div className="space-y-3">
                  {filteredEnded.map((e) => (
                    <ElectionItem key={e.id} election={e} type="ended" />
                  ))}
                </div>
              </div>
            )}

            {filteredActive.length === 0 && filteredEnded.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? 'No matching elections' : 'No elections found.'}
              </div>
            )}
          </div>

          {/* Leaderboard – only shows ranking for ended elections */}
          <div className="flex-1">
            {renderLeaderboard()}
          </div>
        </div>
      </div>
    </div>
  );
}