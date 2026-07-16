// src/components/auth/AuthLayout.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';   // ✅ import auth

export default function AuthLayout({ children, title, subtitle, backTo = '/' }) {
  const { user } = useAuth();                          // ✅ get current user
  const [topCandidates, setTopCandidates] = useState([]);
  const [electionTitle, setElectionTitle] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  // 🧠 Decide back link based on role
  const backLink = user?.role === 'ADMIN' ? '/admin' : backTo;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/elections', { params: { status: 'ACTIVE', limit: 1 } });
        const active = data.elections?.[0];
        if (active) {
          setElectionTitle(active.title);
          const electionRes = await api.get(`/elections/${active.id}`);
          const election = electionRes.data.election;
          const candidates = election.candidates || [];

          const sorted = [...candidates].sort((a, b) => {
            const nameA = `${a.user?.firstName ?? ''} ${a.user?.lastName ?? ''}`.trim().toLowerCase();
            const nameB = `${b.user?.firstName ?? ''} ${b.user?.lastName ?? ''}`.trim().toLowerCase();
            return nameA.localeCompare(nameB);
          });

          setTopCandidates(sorted.slice(0, 3));

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
          setElectionTitle('');
          setTimeLeft('No active election');
        }
      } catch (err) {
        console.error(err);
        setElectionTitle('');
        setTimeLeft('No active election');
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start">
      {/* Back button */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-6">
        <Link
          to={backLink}                      // ✅ dynamic link
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white shadow-sm transition"
        >
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      {/* Main card */}
      <div className="w-full max-w-6xl mx-auto px-6 py-4">
        <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* LEFT COLUMN – hidden on mobile */}
            <div className="hidden lg:block p-6 lg:p-6 bg-gradient-to-br from-violet-100 to-indigo-100">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">VoteUp</h1>
              <p className="text-gray-600 text-sm mb-8">Secure Digital Voting</p>

              <div className="space-y-8">
                {/* Election Title + LIVE in same row */}
                <div className="flex items-center gap-2">
                  {electionTitle ? (
                    <>
                      <span className="text-lg font-semibold text-gray-800 truncate">
                        {electionTitle}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                      </span>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">No active election</p>
                  )}
                </div>

                {/* Candidate list with avatars and party */}
                <div className="space-y-3">
                  {topCandidates.map((c) => {
                    const avatarUrl = c.avatarUrl;
                    const initials = `${c.user?.firstName?.[0] || ''}${c.user?.lastName?.[0] || ''}`;
                    return (
                      <div key={c.id} className="flex items-center gap-3 border-b border-gray-200 pb-2">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={initials} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-sm font-bold">{initials}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-700 font-medium text-sm">
                            {c.user?.firstName} {c.user?.lastName}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {c.party || 'Independent'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {topCandidates.length === 0 && electionTitle && (
                    <p className="text-gray-500 text-sm">No candidates listed</p>
                  )}
                </div>

                <div className="bg-white/60 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-600">
                    <Clock size={14} />
                    <p className="text-lg font-bold text-gray-800">{timeLeft || '--:--:--'}</p>
                  </div>
                  <p className="text-xs text-gray-500">Time remaining</p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Your Vote. Your Voice. Your Power.</h2>
                  <p className="text-gray-600 text-sm mt-2">
                    Join millions shaping the outcome of talent shows, elections, and competitions in real time.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
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