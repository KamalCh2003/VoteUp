// src/components/admin/Leaderboard.jsx
import { useEffect, useState } from 'react';
import { Trophy, BarChart3, Users, Loader2, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api';

// Color palette for pie chart
const DEMOGRAPHIC_COLORS = ['#7c6fff', '#ff6b8a', '#f5a623', '#60a5fa', '#34d399'];

export default function Leaderboard() {
  const [endedElections, setEndedElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demographics, setDemographics] = useState([]);
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    const fetchEndedElections = async () => {
      try {
        const { data } = await api.get('/elections', { params: { status: 'ENDED' } });
        const elections = data.elections || [];
        const sorted = elections.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
        setEndedElections(sorted);
        
        // If there is at least one ended election, fetch its demographics
        if (sorted.length > 0) {
          fetchDemographics(sorted[0].id);
        }
      } catch (err) {
        console.error('Failed to load ended elections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEndedElections();
  }, []);

  const fetchDemographics = async (electionId) => {
    setLoadingDemo(true);
    try {
      // Adjust the endpoint to match your backend
      // Example: GET /elections/${electionId}/demographics
      const { data } = await api.get(`/elections/${electionId}/demographics`);
      setDemographics(data.demographics || []);
    } catch (err) {
      console.error('Failed to load demographics:', err);
      // Fallback to empty array or sample data if endpoint not ready
      setDemographics([]);
    } finally {
      setLoadingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-violet-400" size={40} />
      </div>
    );
  }

  if (endedElections.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Trophy size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg">No ended elections yet.</p>
        <p className="text-sm">Results will appear here once an election finishes.</p>
      </div>
    );
  }

  // Most recent election (first in sorted list)
  const mostRecentElection = endedElections[0];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy size={24} className="text-violet-400" />
          Election Results Leaderboard
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left + Middle: All ended elections leaderboards (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {endedElections.map((election) => {
            const candidates = election.candidates || [];
            const rankedCandidates = [...candidates].sort((a, b) => b.votesReceived - a.votesReceived);
            return (
              <div
                key={election.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6"
              >
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{election.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <Calendar size={14} />
                      Ended {new Date(election.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {rankedCandidates.length} candidates
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="py-3 px-4 text-gray-400 font-medium">Rank</th>
                        <th className="py-3 px-4 text-gray-400 font-medium">Candidate</th>
                        <th className="py-3 px-4 text-gray-400 font-medium">Party</th>
                        <th className="py-3 px-4 text-gray-400 font-medium text-right">Votes</th>
                        <th className="py-3 px-4 text-gray-400 font-medium text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rankedCandidates.map((candidate, idx) => {
                        const totalVotes = election.totalVotes || 1;
                        const share = ((candidate.votesReceived / totalVotes) * 100).toFixed(1);
                        return (
                          <tr key={candidate.id} className="hover:bg-white/[0.05] transition">
                            <td className="py-3 px-4 font-bold">
                              {idx === 0 ? (
                                <span className="text-yellow-400">#1</span>
                              ) : (
                                <span className="text-gray-400">#{idx + 1}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                  {candidate.user?.firstName?.[0]}
                                  {candidate.user?.lastName?.[0]}
                                </div>
                                <span className="font-medium text-white">
                                  {candidate.user?.firstName} {candidate.user?.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-300">
                              {candidate.party || 'Independent'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-white">
                              {candidate.votesReceived?.toLocaleString() || 0}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-300">
                              {share}%
                            </td>
                          </tr>
                        );
                      })}
                      {rankedCandidates.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            No candidates in this election.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Demographics for most recent election */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-pink-400" />
            Voter Demographics
            <span className="text-xs text-gray-500 ml-2">({mostRecentElection.title})</span>
          </h3>
          {loadingDemo ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-violet-400" size={28} />
            </div>
          ) : demographics.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={demographics}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {demographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEMOGRAPHIC_COLORS[index % DEMOGRAPHIC_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {demographics.map((item) => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.name}</span>
                    <span className="text-white">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p>No demographic data available.</p>
              <p className="text-xs mt-1">Try connecting the demographics endpoint.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}