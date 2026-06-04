import { useEffect, useState } from 'react';
import { Users, Vote, UserCheck, DollarSign, TrendingUp, Activity } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Simple bar chart component (no external lib needed)
function MiniBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32 mt-2">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ height: `${(item.value / max) * 100}%` }}
          />
          <span className="text-[10px] text-gray-500 mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalVoters: 0,
    activeElections: 0,
    candidates: 0,
    revenue: 0,
  });
  const [activeElections, setActiveElections] = useState([]);
  const [chartData, setChartData] = useState([]);
  const toast = useToast();

  useEffect(() => {
    // Fetch admin stats
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load stats'));

    // Fetch active elections for list
    api.get('/elections', { params: { status: 'ACTIVE', limit: 5 } })
      .then(({ data }) => setActiveElections(data.elections || []))
      .catch(() => {});

    // Simulated chart data (could be replaced with a real endpoint)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const simulated = days.map((d) => ({
      label: d,
      value: Math.floor(Math.random() * 200) + 50,
    }));
    setChartData(simulated);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
          <Activity size={12} /> Live updates
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-violet-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Voters</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.totalVoters?.toLocaleString() || 0}
              </h3>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <TrendingUp size={12} /> +12% this month
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Users size={22} className="text-violet-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-cyan-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Active Elections</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.activeElections}
              </h3>
              <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1">
                <Activity size={12} /> {activeElections.length} running
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Vote size={22} className="text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-amber-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Candidates</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.candidates}
              </h3>
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                <UserCheck size={12} /> Pending approval
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <UserCheck size={22} className="text-amber-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-emerald-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                ${(stats.revenue || 0).toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <TrendingUp size={12} /> +8% growth
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign size={22} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Vote Chart + Active Elections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={18} className="text-violet-400" />
            Votes This Week
          </h3>
          <MiniBarChart data={chartData} />
          <p className="text-xs text-gray-500 mt-3 text-center">Simulated data – connect real analytics endpoint</p>
        </div>

        {/* Active Elections List */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Vote size={18} className="text-cyan-400" />
            Active Elections
          </h3>
          {activeElections.length > 0 ? (
            <div className="space-y-4">
              {activeElections.map((election) => {
                const progress = election.maxVoters
                  ? Math.min(100, Math.round((election.totalVotes / election.maxVoters) * 100))
                  : election.totalVotes > 0 ? 50 : 0; // fallback
                return (
                  <div key={election.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-white">{election.title}</span>
                      <span className="text-gray-400">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {election.totalVotes?.toLocaleString()} votes · Ends {new Date(election.endDate).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active elections at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}