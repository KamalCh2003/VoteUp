// src/components/home/LiveElectionSection.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Clock } from 'lucide-react';
import api from '../../services/api';

export default function LiveElectionSection({ search = '' }) {
  const [elections, setElections] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    api.get('/elections', { params: { status: 'ACTIVE', limit: 6 } })
      .then(({ data }) => {
        setElections(data.elections || []);
        const initialTimeLeft = {};
        (data.elections || []).forEach(e => {
          initialTimeLeft[e.id] = getTimeRemaining(e.endDate);
        });
        setTimeLeft(initialTimeLeft);
      })
      .catch(() => {});
  }, []);

  const getTimeRemaining = (endDate) => {
    const total = Date.parse(endDate) - Date.now();
    if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { total, days, hours, minutes, seconds };
  };

  useEffect(() => {
    if (!elections.length) return;
    const interval = setInterval(() => {
      const updated = {};
      elections.forEach(e => {
        updated[e.id] = getTimeRemaining(e.endDate);
      });
      setTimeLeft(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [elections]);

  const filtered = elections.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category?.toLowerCase().includes(search.toLowerCase())
  );

  const colors = [
    'from-blue-500 to-violet-500',
    'from-pink-500 to-orange-400',
    'from-emerald-400 to-cyan-500',
  ];

  const formatCountdown = (time) => {
    if (time.total <= 0) return 'Ended';
    const parts = [];
    if (time.days > 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);
    parts.push(`${time.seconds}s`);
    return parts.join(' ');
  };

  return (
    <section className="relative mx-auto max-w-6xl py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-violet-400 mb-2">
            <Activity size={22} />
            <span className="text-sm font-semibold uppercase tracking-wide">Now Live</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Active Elections</h2>
          <p className="text-gray-400 mt-2 max-w-xl">
            Cast your vote in real‑time – every voice matters. See the latest active elections below.
          </p>
        </div>
        <Link to="/elections" className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition group">
          View all elections <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((election, index) => {
          const total = election.maxVoters || election.totalVotes || 1;
          const progress = Math.min(100, Math.round((election.totalVotes / total) * 100));
          const color = colors[index % colors.length];
          const remaining = timeLeft[election.id] || { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

          return (
            <Link
              key={election.id}
              to={`/elections/${election.id}`}
              className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 cursor-pointer block"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition duration-500 rounded-2xl bg-gradient-to-br ${color} blur-xl`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{election.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1">{election.category}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 border border-emerald-500/20">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400">
                  <Clock size={14} />
                  <span className="font-mono">
                    {remaining.total > 0 ? formatCountdown(remaining) : 'Ended'}
                  </span>
                </div>
                <div className="mt-5 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${color} shadow-lg`} style={{ width: `${progress}%` }} />
                </div>
                {/* Vote count and turnout percentage removed */}
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="text-zinc-400 text-center mt-10">No active elections found.</p>}
    </section>
  );
}