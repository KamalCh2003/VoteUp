// src/components/admin/DashboardOverview.jsx
import React, { Fragment } from 'react'; // 👈 added React import
import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, Vote, UserCheck, TrendingUp, Calendar, BarChart, Clock, Trophy,
  PieChart as PieChartIcon, DollarSign, Shield, Eye, MoreHorizontal,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

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

// Helper to format relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
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
  const [freePaidData, setFreePaidData] = useState([]);
  const [topElectionsRevenue, setTopElectionsRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendRange, setTrendRange] = useState('THIS_YEAR');
  const toast = useToast();

  // Recent Activity – always keep only 5 most recent logs
  const [recentLogs, setRecentLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);

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

  const fetchFreePaid = async () => {
    try {
      const res = await api.get('/admin/votes/free-paid');
      const { free, paid } = res.data;
      setFreePaidData([
        { name: 'Free Votes', value: free, color: '#8b5cf6' },
        { name: 'Paid Votes', value: paid, color: '#10b981' },
      ]);
    } catch (err) {
      console.error('Free/Paid votes error:', err);
      toast.error('Failed to load vote breakdown');
    }
  };

  const fetchTopElectionsByRevenue = async () => {
    try {
      const res = await api.get('/admin/finance/top-elections-revenue');
      setTopElectionsRevenue(res.data.topElections || []);
    } catch (err) {
      console.error('Top elections revenue error:', err);
      toast.error('Failed to load top elections');
    }
  };

  // Fetch audit logs and keep only the 5 most recent
  const fetchRecentActivities = async () => {
    setActivityLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      const logs = (res.data.logs || []).slice(0, 5);
      setRecentLogs(logs);
    } catch (err) {
      console.error('Failed to fetch recent activities:', err);
      toast.error('Failed to load recent activity');
    } finally {
      setActivityLoading(false);
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
        await fetchFreePaid();
        await fetchTopElectionsByRevenue();
        await fetchRecentActivities();
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

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

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

      {/* ---- Row 1: Vote Trend + Vote Type Breakdown Pie Chart ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 self-start flex items-center gap-2">
            <PieChartIcon size={18} className="text-violet-600" />
            Vote Type Breakdown
          </h3>
          {freePaidData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={freePaidData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {freePaidData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">No data yet</p>
          )}
        </div>
      </div>

      {/* ---- Row 2: Active Elections + Top Performing Elections by Revenue ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                      <span className="text-gray-500">
                        {election.totalVotes?.toLocaleString()} votes · {progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Ends {new Date(election.endDate).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active elections at the moment.</p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600" />
            Top Performing Elections by Revenue
          </h3>
          {topElectionsRevenue.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="text-left py-2 px-4 font-medium">Election</th>
                    <th className="text-right py-2 px-4 font-medium">Votes</th>
                    <th className="text-right py-2 px-4 font-medium">Revenue</th>
                    <th className="text-right py-2 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topElectionsRevenue.map((election) => (
                    <tr key={election.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{election.title}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{election.votes.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                        रू {election.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            election.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : election.status === 'UPCOMING'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {election.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No paid voting data available.</p>
          )}
        </div>
      </div>

      {/* ---- Row 3: Top 10 Most Active Voters ---- */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 mb-6">
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

      {/* ---- Recent Activity – 5 most recent logs, no pagination ---- */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={18} className="text-violet-600" />
            Recent Activity
          </h3>
          <Link
            to="/admin/audit-logs"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 transition flex items-center gap-1"
          >
            View all logs
            <Eye size={16} />
          </Link>
        </div>

        {activityLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600" />
          </div>
        ) : recentLogs.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No activity recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                  <th className="text-left py-3 px-4 font-medium">Event</th>
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Result</th>
                  <th className="text-right py-3 px-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLogs.map((log) => (
                  <Fragment key={log.id}>
                    <tr
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => toggleExpand(log.id)}
                    >
                      <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {formatRelativeTime(log.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${
                            log.event.includes('LOGIN')
                              ? 'bg-cyan-100 text-cyan-700 border-cyan-200'
                              : log.event.includes('VOTE')
                              ? 'bg-violet-100 text-violet-700 border-violet-200'
                              : log.event.includes('PAYMENT')
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : log.event.includes('FAILED') || log.event.includes('REJECTED')
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {log.event}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{log.user?.email || 'System'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${
                            log.result === 'OK'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : log.result === 'Blocked'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-amber-100 text-amber-700 border-amber-200'
                          }`}
                        >
                          {log.result}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-gray-500 hover:text-gray-700 transition">
                          {expandedLogId === log.id ? (
                            <MoreHorizontal size={16} className="rotate-90" />
                          ) : (
                            <MoreHorizontal size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedLogId === log.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="py-3 px-4 text-gray-600 text-xs">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex gap-2">
                              <span className="text-gray-500">IP:</span>
                              <span className="text-gray-800">{log.ipAddress || 'N/A'}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-gray-500">Details:</span>
                              <span className="text-gray-800">{log.details || 'No additional details'}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}