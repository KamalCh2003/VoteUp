// src/components/admin/Leaderboard.jsx
import { useEffect, useState } from 'react';
import { Trophy, Calendar, Clock, Users, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function Leaderboard() {
  const [activeElections, setActiveElections] = useState([]);
  const [endedElections, setEndedElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});

  const getTimeRemaining = (endDate) => {
    const total = Date.parse(endDate) - Date.now();
    if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { total, days, hours, minutes, seconds };
  };

  const formatCountdown = (time) => {
    if (time.total <= 0) return 'Ended';
    const parts = [];
    if (time.days > 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);
    parts.push(`${time.seconds}s`);
    return parts.join(' ');
  };

  useEffect(() => {
    const fetchAllElections = async () => {
      setLoading(true);
      try {
        const [activeRes, endedRes] = await Promise.all([
          api.get('/elections', { params: { status: 'ACTIVE' } }),
          api.get('/elections', { params: { status: 'ENDED' } }),
        ]);
        const active = activeRes.data.elections || [];
        const ended = endedRes.data.elections || [];

        active.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        ended.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

        setActiveElections(active);
        setEndedElections(ended);

        const initial = {};
        active.forEach(e => { initial[e.id] = getTimeRemaining(e.endDate); });
        setTimeLeft(initial);

        if (active.length > 0) {
          await selectElection(active[0].id, true);
        } else if (ended.length > 0) {
          await selectElection(ended[0].id, false);
        }
      } catch (err) {
        console.error('Failed to load elections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllElections();
  }, []);

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
  }, [activeElections]);

  const selectElection = async (electionId, isActive) => {
    try {
      const { data } = await api.get(`/elections/${electionId}`);
      const election = data.election;
      const sorted = [...(election.candidates || [])].sort((a, b) => b.votesReceived - a.votesReceived);
      setSelectedElection(election);
      setRankedCandidates(sorted);
    } catch (err) {
      console.error('Failed to fetch election details:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="animate-spin text-violet-500" size={40} />
      </div>
    );
  }

  const renderRankingTable = (candidates, totalVotes) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="py-3 px-4 text-gray-500 font-medium">Rank</th>
              <th className="py-3 px-4 text-gray-500 font-medium">Candidate</th>
              <th className="py-3 px-4 text-gray-500 font-medium">Party</th>
              <th className="py-3 px-4 text-gray-500 font-medium text-right">Votes</th>
              <th className="py-3 px-4 text-gray-500 font-medium text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {candidates.map((candidate, idx) => {
              const share = ((candidate.votesReceived / totalVotes) * 100).toFixed(1);
              return (
                <tr key={candidate.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-bold">
                    {idx === 0 ? <span className="text-yellow-600">#1</span> : <span className="text-gray-500">#{idx + 1}</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                        {candidate.avatarUrl ? (
                          <img src={candidate.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          `${candidate.user?.firstName?.[0]}${candidate.user?.lastName?.[0]}`
                        )}
                      </div>
                      <span className="font-medium text-gray-800">
                        {candidate.user?.firstName} {candidate.user?.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{candidate.party || 'Independent'}</td>
                  <td className="py-3 px-4 text-right font-mono text-gray-700">
                    {candidate.votesReceived?.toLocaleString() || 0}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">{share}%</td>
                </tr>
              );
            })}
            {candidates.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">No candidates yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy size={24} className="text-violet-600" />
          Election Leaderboard
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDEBAR – Active Elections List */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Ongoing Elections
          </h3>
          {activeElections.length === 0 ? (
            <p className="text-sm text-gray-500">No ongoing elections.</p>
          ) : (
            <div className="space-y-3">
              {activeElections.map((election) => {
                const remaining = timeLeft[election.id] || { total: 0 };
                const isSelected = selectedElection?.id === election.id;
                return (
                  <div
                    key={election.id}
                    onClick={() => selectElection(election.id, true)}
                    className={`p-3 rounded-xl cursor-pointer transition ${
                      isSelected ? 'bg-violet-100 border border-violet-300' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{election.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Calendar size={12} />
                          Ends {new Date(election.endDate).toLocaleDateString()}
                        </div>
                        {remaining.total > 0 && (
                          <div className="flex items-center gap-1 text-xs text-cyan-600 mt-1">
                            <Clock size={12} />
                            {formatCountdown(remaining)}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={16} className={`text-gray-400 transition ${isSelected ? 'translate-x-1 text-violet-600' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN – Selected Election Details + Past Elections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Election Details */}
          {selectedElection && (
            <div className={`rounded-2xl border border-gray-200 shadow-sm p-6 ${
              selectedElection.status === 'ACTIVE' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-800">{selectedElection.title}</h3>
                    {selectedElection.status === 'ACTIVE' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar size={14} />
                    {selectedElection.status === 'ACTIVE' ? 'Ends' : 'Ended'} {new Date(selectedElection.endDate).toLocaleDateString()}
                    {selectedElection.status === 'ACTIVE' && timeLeft[selectedElection.id]?.total > 0 && (
                      <span className="flex items-center gap-1 ml-2 text-cyan-600">
                        <Clock size={12} />
                        {formatCountdown(timeLeft[selectedElection.id])}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  {rankedCandidates.length} candidates
                </div>
              </div>
              {renderRankingTable(rankedCandidates, selectedElection.totalVotes || 1)}
            </div>
          )}

          {/* Past Elections Section */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-gray-500" />
              Past Elections
            </h3>
            {endedElections.length === 0 ? (
              <p className="text-sm text-gray-500">No past elections yet.</p>
            ) : (
              <div className="space-y-4">
                {endedElections.map((election) => {
                  const candidates = election.candidates || [];
                  const ranked = [...candidates].sort((a, b) => b.votesReceived - a.votesReceived);
                  const winner = ranked[0];
                  return (
                    <div
                      key={election.id}
                      onClick={() => selectElection(election.id, false)}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-800">{election.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Calendar size={12} />
                            Ended {new Date(election.endDate).toLocaleDateString()}
                          </div>
                          {winner && (
                            <div className="flex items-center gap-2 text-xs text-yellow-600 mt-1">
                              <Trophy size={12} />
                              Winner: {winner.user?.firstName} {winner.user?.lastName} ({winner.votesReceived} votes)
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {candidates.length} candidates
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}