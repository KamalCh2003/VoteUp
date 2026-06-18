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

  const fetchAllElections = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, endedRes] = await Promise.all([
        api.get('/elections', { params: { status: 'ACTIVE' } }),
        api.get('/elections', { params: { status: 'ENDED' } })
      ]);

      let active = activeRes.data.elections || [];
      let ended = endedRes.data.elections || [];

      active.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      ended.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

      setActiveElections(active);
      setEndedElections(ended);
      setLastUpdated(new Date());

      let defaultElectionId = active[0]?.id || ended[0]?.id;

      if (defaultElectionId) {
        const { data } = await api.get(`/elections/${defaultElectionId}`);
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

  useEffect(() => {
    fetchAllElections();
    const interval = setInterval(fetchAllElections, 30000);
    return () => clearInterval(interval);
  }, [fetchAllElections]);

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

  const handleSelectElection = useCallback(async (electionId) => {
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
  }, [selectedElection]);

  const filteredEnded = useMemo(() => {
    return endedElections.filter(e =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [endedElections, searchTerm]);

  const ElectionItem = ({ election, type }) => {
    const remaining = timeLeft[election.id] || {};
    const isActive = type === 'active';
    const isSelected = selectedElection?.id === election.id;

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

        {isActive && remaining.total > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
            <Clock size={12} />
            <span className="font-mono">{formatCountdown(remaining)}</span>
          </div>
        )}
      </div>
    );
  };

  if (loading && !selectedElection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col lg:flex-row gap-8">

        {/* LEFT */}
        <div className="lg:w-1/3 space-y-6">

          <div className="text-xs text-gray-500 flex items-center gap-2">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Last updated: {lastUpdated?.toLocaleTimeString() || '--:--'}
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Search past elections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <h2 className="font-bold mb-3 flex items-center gap-2 text-gray-800">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              Ongoing Elections
            </h2>

            <div className="space-y-3">
              {activeElections.map(e => (
                <ElectionItem key={e.id} election={e} type="active" />
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold mb-3 flex items-center gap-2 text-gray-800">
              <Trophy size={16} /> Past Elections
            </h2>

            <div className="space-y-3">
              {filteredEnded.map(e => (
                <ElectionItem key={e.id} election={e} type="ended" />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:w-2/3">
          {!selectedElection ? (
            <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
              Select an election to view results
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">

              <div className="p-5 border-b bg-gray-50">
                <h2 className="text-xl font-bold">{selectedElection.title}</h2>
                <p className="text-sm text-gray-500">{selectedElection.description}</p>

                <div className="flex gap-4 text-xs text-gray-500 mt-2">
                  <span>
                    <Calendar size={12} className="inline mr-1" />
                    {new Date(selectedElection.startDate).toLocaleDateString()} - {new Date(selectedElection.endDate).toLocaleDateString()}
                  </span>
                  <span>
                    {selectedElection.status}
                  </span>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Candidate</th>
                    <th className="p-3 text-left">Party</th>
                    <th className="p-3 text-right">Share</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedCandidates.map((c, i) => {
                    const total = selectedElection.totalVotes || 1;
                    const share = ((c.votesReceived / total) * 100).toFixed(1);

                    return (
                      <tr key={c.id} className="border-t">
                        <td className="p-3 font-bold">#{i + 1}</td>
                        <td className="p-3">
                          {c.user?.firstName} {c.user?.lastName}
                        </td>
                        <td className="p-3 text-gray-600">{c.party || 'Independent'}</td>
                        <td className="p-3 text-right">{share}%</td>
                      </tr>
                    );
                  })}

                  {selectedCandidates.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center p-6 text-gray-400">
                        No candidates found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="p-3 text-xs text-gray-500 text-right border-t">
                Total candidates: {selectedCandidates.length}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}