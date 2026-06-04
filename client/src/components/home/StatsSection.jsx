import { useEffect, useState } from 'react';
import { Users, Vote, TrendingUp, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function StatsSection() {
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalVotes: 0,
    activeElections: 0,
    securityLevel: '100%',
    uptime: '99.9%',
  });

  useEffect(() => {
    api.get('/public/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  const statsData = [
    { title: 'Voters', value: stats.totalVoters.toLocaleString(), icon: Users, color: 'from-violet-500 to-purple-600' },
    { title: 'Votes Cast', value: stats.totalVotes.toLocaleString(), icon: Vote, color: 'from-cyan-500 to-blue-600' },
    { title: 'Active Elections', value: stats.activeElections, icon: TrendingUp, color: 'from-emerald-500 to-green-600' },
    { title: 'Secure', value: stats.securityLevel, icon: ShieldCheck, color: 'from-pink-500 to-rose-600' },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
              <div className={`absolute -top-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r ${stat.color} opacity-20 blur-xl`}></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400">{stat.title}</p>
                  <h3 className="text-lg font-semibold text-white">{stat.value}</h3>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-r ${stat.color}`}>
                  <Icon size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}