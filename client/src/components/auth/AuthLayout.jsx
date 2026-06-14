// src/components/auth/AuthLayout.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Clock } from 'lucide-react';
import api from '../../services/api';

export default function AuthLayout({ children, title, subtitle, backTo = '/' }) {
  const [topCandidates, setTopCandidates] = useState([]);
  const [stats, setStats] = useState({ totalVotesToday: 0 });
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/elections', { params: { status: 'ACTIVE', limit: 1 } });
        const active = data.elections?.[0];
        if (active) {
          const electionRes = await api.get(`/elections/${active.id}`);
          const candidates = electionRes.data.election.candidates || [];
          const sorted = [...candidates].sort((a, b) => b.votesReceived - a.votesReceived).slice(0, 3);
          setTopCandidates(sorted);
          const end = new Date(active.endDate);
          const updateCountdown = () => {
            const diff = end - new Date();
            if (diff <= 0) setTimeLeft('Ended');
            else {
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (3600000)) / 60000);
              const seconds = Math.floor((diff % 60000) / 1000);
              setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
          };
          updateCountdown();
          const interval = setInterval(updateCountdown, 1000);
          return () => clearInterval(interval);
        } else {
          setTopCandidates([]);
          setTimeLeft('No active election');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeaderboard();
    setStats({ totalVotesToday: 48200 });
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start">
      {/* Back button – leftmost side */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-6">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white shadow-sm transition"
        >
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      {/* Main card – centered with natural scrolling */}
      <div className="w-full max-w-6xl mx-auto px-6 py-4">
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* LEFT COLUMN – hidden on mobile, visible on lg+ */}
            <div className="hidden lg:block p-6 lg:p-6 bg-gradient-to-br from-violet-100 to-indigo-100">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">VoteUp</h1>
              <p className="text-gray-600 text-sm mb-8">Secure Digital Voting</p>

              <div className="space-y-8">
                {/* Live Leaderboard */}
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 mb-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Live Leaderboard</span>
                  </div>
                  <div className="space-y-3">
                    {topCandidates.map((c, idx) => (
                      <div key={c.id} className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <div className="flex items-center gap-2">
                          <Trophy size={16} className={idx === 0 ? 'text-yellow-500' : 'text-gray-400'} />
                          <span className="text-gray-700 font-medium text-sm">
                            {c.user?.firstName} {c.user?.lastName}
                          </span>
                        </div>
                        <span className="text-violet-600 font-mono text-sm">{c.votesReceived.toLocaleString()} votes</span>
                      </div>
                    ))}
                    {topCandidates.length === 0 && <p className="text-gray-500 text-sm">No active elections</p>}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats.totalVotesToday.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Votes cast today</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-emerald-600">
                      <Clock size={14} />
                      <p className="text-lg font-bold text-gray-800">{timeLeft || '--:--:--'}</p>
                    </div>
                    <p className="text-xs text-gray-500">until next event</p>
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Your Vote. Your Voice. Your Power.</h2>
                  <p className="text-gray-600 text-sm mt-2">
                    Join millions shaping the outcome of talent shows, elections, and competitions in real time.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN – always visible, full width on mobile */}
            <div className="p-6 sm:p-8 lg:p-12">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{title}</h2>
              <p className="text-gray-500 text-sm mb-6">{subtitle}</p>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}