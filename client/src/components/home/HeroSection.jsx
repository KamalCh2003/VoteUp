// src/components/home/HeroSection.jsx
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function HeroSection() {
  const { user } = useAuth();
  const [activeCount, setActiveCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentElection, setRecentElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    setLoadingStats(true);
    api
      .get('/public/stats')
      .then(({ data }) => {
        setActiveCount(data.activeElections || 0);
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));

    const fetchMostRecentActiveElection = async () => {
      setLoadingCandidates(true);
      try {
        const { data } = await api.get('/elections', {
          params: { status: 'ACTIVE', limit: 1 },
        });
        const elections = data.elections || [];
        if (elections.length === 0) {
          setRecentElection(null);
          setCandidates([]);
          setLoadingCandidates(false);
          return;
        }
        const mostRecent = elections[0];
        const electionRes = await api.get(`/elections/${mostRecent.id}`);
        const election = electionRes.data.election;
        // Sort alphabetically by full name
        const sorted = [...(election.candidates || [])].sort((a, b) => {
          const nameA = `${a.user?.firstName ?? ''} ${a.user?.lastName ?? ''}`.trim().toLowerCase();
          const nameB = `${b.user?.firstName ?? ''} ${b.user?.lastName ?? ''}`.trim().toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setRecentElection(election);
        setCandidates(sorted.slice(0, 5)); // show top 5 alphabetically
      } catch (err) {
        console.error('Failed to fetch most recent active election:', err);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchMostRecentActiveElection();
    const interval = setInterval(fetchMostRecentActiveElection, 10000);
    return () => clearInterval(interval);
  }, []);

  const votingRoute = user ? '/voter/elections' : '/login';

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-1 mb-10">
        {/* Active Election Badge */}
        <div className="flex justify-center mb-8">
          {loadingStats ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-5 py-2 text-sm text-gray-400 shadow-sm animate-pulse">
              <Sparkles size={14} />
              Loading elections...
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500 bg-green-500 px-5 py-2 text-sm text-white shadow-sm">
              <Sparkles size={14} />
              {activeCount} ACTIVE ELECTION{activeCount !== 1 ? 'S' : ''}
            </div>
          )}
        </div>

        {/* Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left lg:col-span-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-gray-900">
              The future of{' '}
              <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text italic text-transparent">
                democratic
              </span>{' '}
              voting is here
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl lg:mx-0 mx-auto">
              Cast votes with confidence. Blockchain-secured, fully transparent,
              and instantly verified results for every election.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              <Link
                to="/elections"
                className="group flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-violet-700"
              >
                Start Voting
                <ChevronRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/results"
                className="rounded-2xl border border-gray-200 bg-white px-8 py-3 text-lg font-semibold text-gray-800 shadow-sm transition hover:scale-105 hover:bg-gray-50"
              >
                View Results
              </Link>
            </div>
          </div>

          {/* Candidate List (replaces leaderboard) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg lg:col-span-1 hidden lg:block">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Candidates
            </h2>

            {loadingCandidates && candidates.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
              </div>
            ) : !recentElection ? (
              <p className="text-center text-gray-500 py-8">
                No active elections.
              </p>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-3 text-center font-medium">
                  {recentElection.title}
                </div>

                <div className="space-y-3">
                  {candidates.map((candidate) => {
                    const avatarUrl = candidate.avatarUrl;
                    return (
                      <div
                        key={candidate.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                      >
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-bold">
                              {candidate.user?.firstName?.[0]}
                              {candidate.user?.lastName?.[0]}
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="text-gray-900 font-medium text-sm">
                            {candidate.user?.firstName}{' '}
                            {candidate.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {candidate.party || 'Independent'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {candidates.length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No candidates yet.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}