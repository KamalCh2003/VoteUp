// src/components/voter/ElectionList.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Activity } from 'lucide-react';
import api from '../../services/api';

export default function ElectionList() {
  const [search, setSearch] = useState('');
  const [activeElections, setActiveElections] = useState([]);
  const [upcomingElections, setUpcomingElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});

  const getTimeRemaining = (endDate) => {
    const total = Date.parse(endDate) - Date.now();

    if (total <= 0) {
      return {
        total: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      total,
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / (1000 * 60)) % 60),
      seconds: Math.floor((total / 1000) % 60),
    };
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
      api.get('/elections', { params: { status: 'UPCOMING' } }),
    ])
      .then(([activeRes, upcomingRes]) => {
        const active = activeRes.data.elections || [];

        setActiveElections(active);
        setUpcomingElections(upcomingRes.data.elections || []);

        const initial = {};

        active.forEach((election) => {
          initial[election.id] = getTimeRemaining(election.endDate);
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

      activeElections.forEach((election) => {
        updated[election.id] = getTimeRemaining(election.endDate);
      });

      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeElections]);

  const filterElections = (elections) =>
    elections.filter(
      (e) =>
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

    const remaining = timeLeft[election.id] || {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    return (
      <Link
        to={`/elections/${election.id}`}
        className="group relative block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 blur-xl transition duration-500 group-hover:opacity-5`}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {election.title}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {election.category} • Ends{' '}
                {new Date(election.endDate).toLocaleDateString()}
              </p>
            </div>

            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                type === 'active'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  : 'border-amber-200 bg-amber-50 text-amber-600'
              }`}
            >
              {type === 'active' ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
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
            <div className="mt-4 flex items-center gap-2 text-xs text-cyan-600">
              <Clock size={14} />

              <span className="font-mono">
                {remaining.total > 0
                  ? formatCountdown(remaining)
                  : 'Ended'}
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
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-200/40 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-200/40 blur-[140px]" />

        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10">
        {/* Search */}
        <div className="mb-10">
          <input
            type="text"
            placeholder="Search elections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </div>

        {/* Active Elections */}
        {filteredActive.length > 0 && (
          <section className="mb-14">
            <div className="mb-5 flex items-center gap-2 text-violet-600">
              <Activity size={22} />
              <h2 className="text-2xl font-bold text-gray-900">
                Live Elections
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredActive.map((election, idx) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  index={idx}
                  type="active"
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Elections */}
        {filteredUpcoming.length > 0 && (
          <section>
            <div className="mb-5 flex items-center gap-2 text-amber-600">
              <Clock size={22} />
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Elections
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUpcoming.map((election, idx) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  index={idx}
                  type="upcoming"
                />
              ))}
            </div>
          </section>
        )}

        {filteredActive.length === 0 &&
          filteredUpcoming.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-500">
                No elections found.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}