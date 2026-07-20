// src/components/home/LiveElectionSection.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Clock } from 'lucide-react';
import api from '../../services/api';

export default function LiveElectionSection({ search = '' }) {
  const [elections, setElections] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    api
      .get('/elections', { params: { status: 'ACTIVE', limit: 6 } })
      .then(({ data }) => {
        setElections(data.elections || []);

        const initialTimeLeft = {};
        (data.elections || []).forEach((e) => {
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
      elections.forEach((e) => {
        updated[e.id] = getTimeRemaining(e.endDate);
      });
      setTimeLeft(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [elections]);

  const filtered = elections.filter(
    (e) =>
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
    <section className="relative mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-violet-600 mb-2">
            <Activity size={22} />
            <span className="text-sm font-semibold uppercase tracking-wide">Now Live</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Active Elections</h2>
          <p className="text-gray-600 mt-2 max-w-xl">
            Cast your vote in real-time – every voice matters. See the latest active elections below.
          </p>
        </div>
        <Link
          to="/elections"
          className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 transition group font-medium"
        >
          View all elections
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
              className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer block"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition duration-500 rounded-2xl bg-gradient-to-br ${color}`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-gray-900 font-semibold text-lg">{election.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{election.category}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-600 border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-600">
                  <Clock size={14} />
                  <span className="font-mono font-medium">
                    {remaining.total > 0 ? formatCountdown(remaining) : 'Ended'}
                  </span>
                </div>
                <div className="mt-5 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${color}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No active elections found.</p>
      )}
    </section>
  );
}