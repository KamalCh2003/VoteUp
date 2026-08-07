// src/components/home/StatsSection.jsx
import { useEffect, useState } from 'react';
import { Users, Vote, Calendar, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function StatsSection() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVotes: 0,
    totalElections: 0,
    securityLevel: '100%',
    uptime: '99.9%',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [publicStats, electionsRes] = await Promise.all([
          api.get('/public/stats'),
          api.get('/elections'),
        ]);

        const totalElections =
          electionsRes.data.elections?.length || 0;

        setStats({
          totalUsers: publicStats.data.totalUsers || 0,
          totalVotes: publicStats.data.totalVotes || 0,
          totalElections,
          securityLevel:
            publicStats.data.securityLevel || '100%',
          uptime: publicStats.data.uptime || '99.9%',
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      title: 'Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
    },
    {
      title: 'Votes Cast',
      value: stats.totalVotes.toLocaleString(),
      icon: Vote,
      color: 'from-cyan-500 to-blue-600',
      bg: 'bg-cyan-50',
    },
    {
      title: 'Total Elections',
      value: stats.totalElections.toLocaleString(),
      icon: Calendar,
      color: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Secure',
      value: stats.securityLevel,
      icon: ShieldCheck,
      color: 'from-pink-500 to-rose-600',
      bg: 'bg-pink-50',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {statsData.map((stat, idx) => {
          const Icon = stat.icon;

          return (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Decorative Glow */}
              <div
                className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-r ${stat.color} opacity-10 blur-2xl`}
              />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${stat.color} text-white shadow-md`}
                  >
                    <Icon size={18} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}