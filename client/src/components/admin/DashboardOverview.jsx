// src/components/admin/DashboardOverview.jsx
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Vote, UserCheck, TrendingUp, Calendar, BarChart, Clock, Trophy,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-md">
        <p className="text-gray-700 text-sm">{label}</p>
        <p className="text-violet-600 font-bold">{payload[0].value} votes</p>
      </div>
    );
  }
  return null;
};

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
  const [topVoters, setTopVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendRange, setTrendRange] = useState('THIS_YEAR');
  const toast = useToast();

  const fetchTrend = async (range) => {
    try {
      const res = await api.get('/admin/votes/trend', { params: { range } });
      setVoteTrend(res.data.trend || []);
    } catch (err) {
      console.error('Vote trend error:', err);
      toast.error('Failed to load vote trend');
    }
  };

  const fetchTopVoters = async () => {
    try {
      const res = await api.get('/admin/finance/top-voters', { params: { limit: 10 } });
      setTopVoters(res.data.topVoters || []);
    } catch (err) {
      console.error('Top voters error:', err);
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

        await fetchTrend(trendRange);
        await fetchTopVoters();
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) fetchTrend(trendRange);
  }, [trendRange, loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="py-6">
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

      {/* Charts Row: Vote Trend + Active Elections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vote Trend Chart with Range Selector */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-violet-600" />
              Vote Trend
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-violet-500" />
              <select
                value={trendRange}
                onChange={(e) => setTrendRange(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-gray-700 outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="LAST_MONTH">Last Month</option>
                <option value="LAST_3_MONTHS">Last 3 Months</option>
                <option value="LAST_6_MONTHS">Last 6 Months</option>
                <option value="THIS_YEAR">This Year</option>
                <option value="LAST_5_YEARS">Last 5 Years</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={voteTrend}>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="votes"
                stroke="#7c6fff"
                strokeWidth={3}
                dot={{ r: 4, fill: '#7c6fff', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#7c6fff', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Active Elections */}
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

      {/* Top 10 Most Active Voters */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          Top 10 Most Active Voters
        </h3>
        {topVoters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {topVoters.map((voter, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {voter.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{voter.name}</p>
                  <p className="text-xs text-gray-500">{voter.votes} times voted</p>
                </div>
                {idx < 3 && (
                  <Trophy size={16} className={`ml-auto ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No voting activity recorded yet.</p>
        )}
      </div>
    </div>
  );
}