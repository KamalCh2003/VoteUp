// src/components/admin/DashboardOverview.jsx
import { useEffect, useState } from 'react';
import { Users, Vote, UserCheck, TrendingUp, Activity, Calendar, BarChart } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

function MiniBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.votes), 1);
  return (
    <div className="flex items-end gap-2 h-32 mt-2 overflow-x-auto pb-2">
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center flex-1 min-w-[40px]">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ height: `${(item.votes / max) * 100}%` }}
          />
          <span className="text-[10px] text-gray-500 mt-1">{item.date.slice(5)}</span>
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
    approvedCandidates: 0,
    revenue: 0,
    totalElections: 0,
    totalVotes: 0,
  });
  const [activeElections, setActiveElections] = useState([]);
  const [voteTrend, setVoteTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendRange, setTrendRange] = useState('week');
  const toast = useToast();

  const generateFallbackTrend = (range) => {
    const trend = [];
    if (range === 'year') {
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const monthStr = `${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
        trend.push({ date: monthStr, votes: 0 });
      }
      return trend;
    } else {
      const days = range === 'month' ? 30 : 7;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        trend.push({ date: d.toISOString().split('T')[0], votes: 0 });
      }
      return trend;
    }
  };

  const fetchTrend = async () => {
    try {
      const res = await api.get('/admin/votes/trend', { params: { range: trendRange } });
      let trend = res.data.trend || [];
      if (trend.length === 0) trend = generateFallbackTrend(trendRange);
      setVoteTrend(trend);
    } catch (err) {
      console.error(err);
      setVoteTrend(generateFallbackTrend(trendRange));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsRes = await api.get('/admin/stats');
        const electionsRes = await api.get('/elections');
        const totalElections = electionsRes.data.elections?.length || 0;
        setStats({ ...statsRes.data, totalElections });

        const activeRes = await api.get('/elections', { params: { status: 'ACTIVE', limit: 5 } });
        setActiveElections(activeRes.data.elections || []);

        await fetchTrend();
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
        setVoteTrend(generateFallbackTrend(trendRange));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) fetchTrend();
  }, [trendRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600" />
      </div>
    );
  }

  const totalTrendVotes = voteTrend.reduce((sum, d) => sum + d.votes, 0);
  const hasVotesOutsideRange = stats.totalVotes > 0 && totalTrendVotes === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <span className="text-xs text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1.5">
          <Activity size={12} /> Live data
        </span>
      </div>

      {/* Stats Cards – 6 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-violet-100 blur-xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Voters</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalVoters?.toLocaleString() || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Users size={22} className="text-violet-600" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-cyan-100 blur-xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Approved Candidates</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.approvedCandidates?.toLocaleString() || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
              <UserCheck size={22} className="text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-amber-100 blur-xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Elections</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalElections?.toLocaleString() || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Calendar size={22} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-emerald-100 blur-xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Revenue (NRS)</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">रू {(stats.revenue || 0).toLocaleString()}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-lg">रू</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-purple-100 blur-xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Active Elections</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeElections || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Vote size={22} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-pink-100 blur-xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Votes</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalVotes?.toLocaleString() || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-pink-100 flex items-center justify-center">
              <BarChart size={22} className="text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Vote Chart + Active Elections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-violet-600" />
              Votes ({trendRange === 'week' ? 'Last 7 Days' : trendRange === 'month' ? 'Last 30 Days' : 'This Year'})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTrendRange('week')}
                className={`px-3 py-1 text-xs rounded-lg transition ${
                  trendRange === 'week' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTrendRange('month')}
                className={`px-3 py-1 text-xs rounded-lg transition ${
                  trendRange === 'month' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTrendRange('year')}
                className={`px-3 py-1 text-xs rounded-lg transition ${
                  trendRange === 'year' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Year
              </button>
            </div>
          </div>
          <MiniBarChart data={voteTrend} />
          {hasVotesOutsideRange && (
            <div className="text-center text-xs text-amber-600 mt-3">
              No votes in the selected range. {stats.totalVotes} total votes exist. Try "Month" or "Year".
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Vote size={18} className="text-cyan-600" />
            Active Elections
          </h3>
          {activeElections.length > 0 ? (
            <div className="space-y-4">
              {activeElections.map((election) => {
                const totalVoters = election.maxVoters || election.totalVotes || 1;
                const progress = Math.min(100, Math.round((election.totalVotes / totalVoters) * 100));
                return (
                  <div key={election.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">{election.title}</span>
                      <span className="text-gray-500">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
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