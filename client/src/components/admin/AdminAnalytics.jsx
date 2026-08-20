// src/components/admin/AdminAnalytics.jsx
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  Vote,
  Calendar,
  Activity,
  Trophy,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const COLORS = ['#6D28D9', '#2563EB', '#06B6D4', '#F59E0B', '#22C55E', '#EF4444', '#DB2777', '#0EA5E9'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!data) return null;

  const { votesByCategory, revenueByCategory, topElections, monthlyVotes, paymentsByMethod, overall } = data;

  const voteCategoryData = votesByCategory.map(item => ({
    name: item.category || 'Uncategorized',
    value: item._sum.totalVotes || 0,
  }));

  const revenueCategoryData = revenueByCategory.map(item => ({
    name: item.category || 'Uncategorized',
    value: Number(item.revenue) || 0,
  }));

  const paymentMethodData = paymentsByMethod.map(item => ({
    name: item.type || 'Other',
    value: item._count.id || 0,
    amount: item._sum.amount || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Votes</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{overall.totalVotes.toLocaleString()}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <Vote size={22} className="text-violet-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">रू {overall.totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <DollarSign size={22} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Active Elections</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{overall.activeElections}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
              <Activity size={22} className="text-cyan-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{overall.totalUsers.toLocaleString()}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users size={22} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Votes by Category */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-600" />
            Votes by Category
          </h3>
          {voteCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={voteCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {voteCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-8">No data</p>}
        </div>

        {/* Revenue by Category – Bar Graph */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600" />
            Revenue by Category
          </h3>
          {revenueCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueCategoryData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tick={{ fill: '#888888' }} />
                <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `रू${value}`} />
                <Tooltip formatter={(value) => `रू ${Number(value).toFixed(2)}`} />
                <Bar dataKey="value" fill="#6D28D9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-8">No data</p>}
        </div>
      </div>

      {/* Second Row: Top Elections + Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Elections */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-600" />
            Top Elections
          </h3>
          {topElections.length > 0 ? (
            <div className="space-y-4">
              {topElections.map((election, idx) => (
                <div key={election.id} className="flex items-center gap-4">
                  <div className="w-8 text-center font-bold text-gray-500">#{idx + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-800">{election.title}</span>
                      <span className="text-gray-500">{election.totalVotes.toLocaleString()} votes</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                        style={{ width: `${(election.totalVotes / (topElections[0].totalVotes || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-center py-8">No elections yet</p>}
        </div>
      </div>
    </div>
  );
}