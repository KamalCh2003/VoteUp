import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Users, PieChart, Clock, Shield,
  ArrowRight, Loader2, Trophy, Activity
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AnalyticsView() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/candidates/me/analytics')
      .then(({ data }) => setAnalytics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-violet-400" size={40} />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Shield size={28} className="text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No analytics available</h2>
          <p className="text-gray-400 mb-6">You need to be an approved candidate to view analytics.</p>
          <Link
            to="/contestant/apply"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-3 text-sm font-medium text-white hover:bg-violet-600 transition"
          >
            Apply for Candidacy <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // Mock data for charts (replace with real endpoints later)
  const voteTrendData = [
    { date: 'Jan 1', votes: 120 },
    { date: 'Jan 5', votes: 180 },
    { date: 'Jan 10', votes: 250 },
    { date: 'Jan 15', votes: 320 },
    { date: 'Jan 20', votes: 400 },
    { date: 'Jan 25', votes: analytics.votesReceived || 0 },
  ];

  const demographicData = [
    { name: 'Male', value: 55, color: '#7c6fff' },
    { name: 'Female', value: 38, color: '#ff6b8a' },
    { name: 'Other', value: 7, color: '#f5a623' },
  ];

  const topSupporters = [
    { name: 'Aarav Sharma', votes: 12 },
    { name: 'Priya Patel', votes: 10 },
    { name: 'Rohit KC', votes: 8 },
    { name: 'Sneha Lama', votes: 7 },
    { name: 'Anil Maharjan', votes: 5 },
  ];

  const recentActivity = [
    { action: 'Vote received', from: 'Sita Rana', time: '2 mins ago' },
    { action: 'Campaign viewed', from: 'Unknown', time: '15 mins ago' },
    { action: 'Vote received', from: 'Gopal Khadka', time: '1 hour ago' },
    { action: 'Profile visited', from: 'Unknown', time: '2 hours ago' },
  ];

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">
            Detailed insight into your campaign performance
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-400">
          <Activity size={16} className="text-emerald-400" />
          Live data
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-violet-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Votes Received</p>
              <p className="text-3xl font-bold text-white mt-2">
                {analytics.votesReceived?.toLocaleString() || 0}
              </p>
            </div>
            <BarChart3 className="text-violet-400" size={32} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-emerald-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Votes in Election</p>
              <p className="text-3xl font-bold text-white mt-2">
                {analytics.totalVotes?.toLocaleString() || 0}
              </p>
            </div>
            <TrendingUp className="text-emerald-400" size={32} />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-cyan-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vote Share</p>
              <p className="text-3xl font-bold text-white mt-2">
                {analytics.share || 0}%
              </p>
            </div>
            <Users className="text-cyan-400" size={32} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Vote Trend Chart */}
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-400" />
            Vote Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={voteTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#9090b8" fontSize={12} />
              <YAxis stroke="#9090b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#1c1c32',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#eeeeff' }}
              />
              <Line
                type="monotone"
                dataKey="votes"
                stroke="#7c6fff"
                strokeWidth={3}
                dot={{ r: 5, fill: '#7c6fff', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Demographics Pie Chart */}
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-pink-400" />
            Voter Demographics
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RPieChart>
              <Pie
                data={demographicData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {demographicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1c1c32',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#eeeeff' }}
              />
              <Legend />
            </RPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Top Supporters & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Supporters */}
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />
            Top Supporters
          </h3>
          <div className="space-y-4">
            {topSupporters.map((supporter, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {supporter.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{supporter.name}</p>
                    <p className="text-xs text-gray-400">{supporter.votes} votes</p>
                  </div>
                </div>
                <span className="text-emerald-400 text-sm font-semibold">
                  {supporter.votes} votes
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={18} className="text-blue-400" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center mt-0.5">
                  <Activity size={12} className="text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.from} · {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}