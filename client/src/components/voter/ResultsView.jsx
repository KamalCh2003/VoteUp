// src/pages/ResultsPage.jsx
import { useEffect, useState } from 'react';
import { Trophy, BarChart3, X, Search } from 'lucide-react';
import api from '../../services/api';

export default function ResultsPage() {
  const [allResults, setAllResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidatesRanked, setCandidatesRanked] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    api.get('/elections', { params: { status: 'ENDED' } })
      .then(({ data }) => {
        const endedElections = data.elections || [];
        const formatted = endedElections.map(e => ({
          id: e.id,
          title: e.title,
          category: e.category,
          winner: e.candidates?.[0]?.user?.firstName 
            ? `${e.candidates[0].user.firstName} ${e.candidates[0].user.lastName}` 
            : 'No winner',
          votes: e.totalVotes || 0,
          total: e.maxVoters || e.totalVotes || 1,
          percentage: e.totalVotes && e.maxVoters ? Math.round((e.totalVotes / e.maxVoters) * 100) : 0,
          status: e.status,
        }));
        setAllResults(formatted);
      })
      .catch(() => {});
  }, []);

  const filteredResults = allResults.filter(result =>
    result.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = async (electionId) => {
    setLoadingModal(true);
    try {
      const { data } = await api.get(`/elections/${electionId}`);
      const election = data.election;
      const sorted = [...(election.candidates || [])].sort((a, b) => b.votesReceived - a.votesReceived);
      setCandidatesRanked(sorted);
      setSelectedElection(election);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setSelectedElection(null);
    setCandidatesRanked([]);
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header row: title left, search right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 size={34} className="text-violet-400" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Election Results</h1>
              <p className="text-zinc-400 text-sm mt-1">Final results of completed elections</p>
            </div>
          </div>

          {/* Search bar on the right */}
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by election..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-violet-500/50 transition"
            />
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResults.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-violet-500/30 transition cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold group-hover:text-violet-400 transition">
                  {item.title}
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-400">
                  {item.category}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-violet-400">
                <Trophy size={18} />
                <span className="font-medium">Winner: {item.winner}</span>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-sm text-zinc-400 mb-2">
                  <span>Votes</span>
                  <span>
                    {item.votes.toLocaleString()} / {item.total.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-violet-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-zinc-500">Click to see full ranking</p>
            </div>
          ))}

          {filteredResults.length === 0 && (
            <p className="text-center text-zinc-500 col-span-full">
              {allResults.length === 0 ? 'No ended elections yet.' : 'No matching elections found.'}
            </p>
          )}
        </div>
      </div>

      {/* Modal (unchanged) */}
      {selectedElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="relative w-full max-w-3xl bg-[#0B1020] border border-white/10 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedElection.title}</h2>
              <p className="text-gray-400 text-sm mb-6">{selectedElection.description}</p>

              {loadingModal ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-400"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Candidate</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Party</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Votes</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {candidatesRanked.map((candidate, idx) => {
                          const totalVotes = selectedElection.totalVotes || 1;
                          const share = ((candidate.votesReceived / totalVotes) * 100).toFixed(1);
                          return (
                            <tr key={candidate.id} className="hover:bg-white/5 transition">
                              <td className="py-3 px-4 font-bold text-white">
                                {idx === 0 && <Trophy size={14} className="inline text-yellow-400 mr-1" />}
                                #{idx + 1}
                              </td>
                              <td className="py-3 px-4 text-white">
                                {candidate.user?.firstName} {candidate.user?.lastName}
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
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-sm text-gray-400">
                    <span>Total votes cast: {selectedElection.totalVotes?.toLocaleString()}</span>
                    <span>Total candidates: {candidatesRanked.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}