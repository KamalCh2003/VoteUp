// src/components/voter/ElectionList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Vote, Clock, ArrowRight, Activity } from 'lucide-react';
import api from '../../services/api';

export default function ElectionList() {
  const [search, setSearch] = useState('');
  const [activeElections, setActiveElections] = useState([]);
  const [upcomingElections, setUpcomingElections] = useState([]);
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
    Promise.all([
      api.get('/elections', { params: { status: 'ACTIVE' } }),
      api.get('/elections', { params: { status: 'UPCOMING' } })
    ])
      .then(([activeRes, upcomingRes]) => {
        const active = activeRes.data.elections || [];
        setActiveElections(active);
        setUpcomingElections(upcomingRes.data.elections || []);
        const initial = {};
        active.forEach(e => {
          initial[e.id] = getTimeRemaining(e.endDate);
        });
        setTimeLeft(initial);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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

  const filterElections = (elections) =>
    elections.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase())
    );

  const filteredActive = filterElections(activeElections);
  const filteredUpcoming = filterElections(upcomingElections);

  const colors = [
    'from-blue-500 to-violet-500',
    'from-pink-500 to-orange-400',
    'from-emerald-400 to-cyan-500',
  ];

  const ElectionCard = ({ election, index, type }) => {
    const color = colors[index % colors.length];
    const remaining = timeLeft[election.id] || { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

    return (
      <Link
        to={`/elections/${election.id}`}
        className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 cursor-pointer block"
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition duration-500 rounded-2xl bg-gradient-to-br ${color} blur-xl`} />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">{election.title}</h3>
              <p className="text-sm text-zinc-400 mt-1">
                {election.category} • Ends {new Date(election.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs border ${
              type === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {type === 'active' ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </>
              ) : (
                <>
                  <Clock size={12} />
                  Upcoming
                </>
              )}
            </div>
          </div>
          {type === 'active' && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400">
              <Clock size={14} />
              <span className="font-mono">
                {remaining.total > 0 ? formatCountdown(remaining) : 'Ended'}
              </span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden text-white">
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10">
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search elections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-violet-500/50"
          />
        </div>

        {filteredActive.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 text-violet-400 mb-4">
              <Activity size={22} />
              <h2 className="text-2xl font-bold text-white">Live Elections</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredActive.map((election, idx) => (
                <ElectionCard key={election.id} election={election} index={idx} type="active" />
              ))}
            </div>
          </div>
        )}

        {filteredUpcoming.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-amber-400 mb-4">
              <Clock size={22} />
              <h2 className="text-2xl font-bold text-white">Upcoming Elections</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUpcoming.map((election, idx) => (
                <ElectionCard key={election.id} election={election} index={idx} type="upcoming" />
              ))}
            </div>
          </div>
        )}

        {filteredActive.length === 0 && filteredUpcoming.length === 0 && (
          <p className="text-zinc-400 text-center mt-10">No elections found.</p>
        )}
      </div>
    </div>
  );
}