// src/components/home/HeroSection.jsx
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function HeroSection() {
  const { user } = useAuth();
  const [activeCount, setActiveCount] = useState(0);
  const [recentElection, setRecentElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  useEffect(() => {
    api.get('/public/stats')
      .then(({ data }) => setActiveCount(data.activeElections || 0))
      .catch(() => {});

    const fetchMostRecentActiveElection = async () => {
      setLoadingRanking(true);
      try {
        const { data } = await api.get('/elections', {
          params: { status: 'ACTIVE', limit: 1 },
        });
        const elections = data.elections || [];
        if (elections.length === 0) {
          setRecentElection(null);
          setCandidates([]);
          setLoadingRanking(false);
          return;
        }

        const mostRecent = elections[0];
        const electionRes = await api.get(`/elections/${mostRecent.id}`);
        const election = electionRes.data.election;
        const sortedCandidates = [...(election.candidates || [])].sort(
          (a, b) => b.votesReceived - a.votesReceived
        );
        setRecentElection(election);
        setCandidates(sortedCandidates.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch most recent active election:', err);
      } finally {
        setLoadingRanking(false);
      }
    };

    fetchMostRecentActiveElection();
    const interval = setInterval(fetchMostRecentActiveElection, 10000);
    return () => clearInterval(interval);
  }, []);

  const votingRoute = user ? '/voter/elections' : '/login';

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-1 md:py-4 mb-10">
        {/* Centered active election badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500 bg-green-500 px-5 py-2 text-sm text-white backdrop-blur-xl">
            <Sparkles size={14} />
            {activeCount} ACTIVE ELECTION{activeCount !== 1 ? 'S' : ''}
          </div>
        </div>

        {/* Two‑column layout: left text, right ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column: Hero text & buttons */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
              The future of{' '}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text italic text-transparent">
                democratic
              </span>{' '}
              voting is here
            </h1>

            <p className="mt-6 text-lg leading-8 text-zinc-400 max-w-2xl lg:mx-0 mx-auto">
              Cast votes with confidence. Blockchain‑secured, fully transparent,
              and instantly verified results for every election.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              <Link
                to={votingRoute}
                className="group flex items-center gap-2 rounded-2xl bg-violet-500 px-8 py-3 text-lg font-semibold transition hover:scale-105 hover:bg-violet-400"
              >
                Start Voting
                <ChevronRight size={20} className="transition group-hover:translate-x-1" />
              </Link>

              <Link
                to="/results"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-3 text-lg font-semibold backdrop-blur-xl transition hover:scale-105 hover:bg-white/[0.08]"
              >
                View Results
              </Link>
            </div>
          </div>

          {/* Right column: Live ranking of the most recent election – no vote numbers */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-yellow-400" size={22} />
              <h2 className="text-xl font-bold text-white">Live Leaderboard</h2>
              <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>

            {loadingRanking && candidates.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-400"></div>
              </div>
            ) : !recentElection ? (
              <p className="text-center text-gray-400 py-8">No active elections.</p>
            ) : (
              <>
                <div className="text-sm text-gray-300 mb-3 text-center">
                  {recentElection.title}
                </div>
                <div className="space-y-4">
                  {candidates.map((candidate, idx) => {
                    const avatarUrl = candidate.avatarUrl;
                    return (
                      <div
                        key={candidate.id}
                        className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
                      >
                        <div className="w-8 text-center font-bold text-gray-400">#{idx + 1}</div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-sm font-bold">
                              {candidate.user?.firstName?.[0]}{candidate.user?.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">
                            {candidate.user?.firstName} {candidate.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{candidate.party || 'Independent'}</p>
                        </div>
                        {/* Vote count column removed */}
                      </div>
                    );
                  })}
                </div>
                {candidates.length === 0 && (
                  <p className="text-center text-gray-400 py-4">No candidates yet.</p>
                )}
              </>
            )}

            <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-gray-500">
              Updated every 10 seconds – top candidates of the most recent active election
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}