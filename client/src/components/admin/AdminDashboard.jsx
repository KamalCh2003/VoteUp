import { useEffect, useState } from 'react';
import { getStats } from '../../services/adminService';
import StatCard from '../common/StatCard';
import GlassCard from '../common/GlassCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    getStats().then(({ data }) => setStats(data));
  }, []);

  return (
    <div className="mt-6">
      <h1 className="text-lg font-semibold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-4 gap-2 mb-6">
        <StatCard icon="👥" value={stats.totalVoters} label="Voters" color="var(--a)" />
        <StatCard icon="📋" value={stats.activeElections} label="Active" color="var(--a2)" />
        <StatCard icon="👔" value={stats.candidates} label="Candidates" color="var(--a4)" />
        <StatCard icon="💰" value={`$${(stats.revenue || 0).toFixed(0)}`} label="Revenue" color="var(--a3)" />
      </div>
    </div>
  );
}