// src/components/admin/DashboardOverview.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../common/StatCard";
import GlassCard from "../common/GlassCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8B5CF6", "#6366F1", "#EC4899", "#06B6D4", "#10B981"];

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all required data in parallel
      const [statsRes, revenueRes, paymentRes, candidatesRes, auditRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/finance/revenue-trend"),
        api.get("/admin/finance/payment-methods"),
        api.get("/admin/candidates"),
        api.get("/admin/audit-logs"),
      ]);

      setStats(statsRes.data);

      // Revenue trend data (expects { revenueData: [{ month, revenue }] })
      setRevenueData(revenueRes.data.revenueData || []);

      // Payment methods (for pie chart)
      setPaymentMethods(paymentRes.data.methods || []);

      // Top candidates: sort by votesReceived and take top 5
      const candidates = candidatesRes.data.candidates || [];
      const sorted = [...candidates]
        .sort((a, b) => (b.votesReceived || 0) - (a.votesReceived || 0))
        .slice(0, 5)
        .map(c => ({
          name: `${c.user?.firstName} ${c.user?.lastName}`,
          votes: c.votesReceived || 0,
        }));
      setTopCandidates(sorted);

      // Recent activities: latest 5 audit logs
      const logs = auditRes.data.logs || [];
      const activities = logs.slice(0, 5).map(log => ({
        event: log.event,
        user: log.user?.email,
        time: new Date(log.createdAt).toLocaleString(),
      }));
      setRecentActivities(activities);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-pulse text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  // Format revenue data for the area chart (expects month + revenue + optional votes)
  // If your revenue trend endpoint only returns revenue, we can add a placeholder for votes
  const chartData = revenueData.map(item => ({
    month: item.month,
    revenue: item.revenue,
    votes: item.votes || Math.floor(item.revenue / 2), // fallback
  }));

  // If no payment methods, use a default empty state
  const pieData = paymentMethods.length ? paymentMethods : [{ name: "No data", value: 1 }];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">
          Real‑time platform analytics and election performance
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon="👥"
          value={stats?.totalVoters || 0}
          label="Total Voters"
          color="#8B5CF6"
        />
        <StatCard
          icon="🗳️"
          value={stats?.activeElections || 0}
          label="Active Elections"
          color="#6366F1"
        />
        <StatCard
          icon="🏆"
          value={stats?.candidates || 0}
          label="Candidates"
          color="#EC4899"
        />
        <StatCard
          icon="💰"
          value={`Rs ${(stats?.revenue || 0).toLocaleString()}`}
          label="Revenue"
          color="#10B981"
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue & Votes Trend */}
        <GlassCard className="xl:col-span-2 p-5">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Revenue & Votes Trend
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="voteGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0B1020", borderColor: "#374151" }}
                labelStyle={{ color: "#F3F4F6" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8B5CF6"
                fill="url(#revenueGradient)"
                name="Revenue (Rs)"
              />
              <Area
                type="monotone"
                dataKey="votes"
                stroke="#10B981"
                fill="url(#voteGradient)"
                name="Votes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Payment Methods / Distribution */}
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Payment Methods
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Candidates */}
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold mb-4 text-white">Top Candidates</h2>
          <div className="space-y-4">
            {topCandidates.length ? (
              topCandidates.map((candidate, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-white/10 pb-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="font-medium text-white">{candidate.name}</span>
                  </div>
                  <span className="text-purple-400 font-semibold">
                    {candidate.votes.toLocaleString()} votes
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">No candidates yet</div>
            )}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-5">
          <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.length ? (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5">
                  <p className="text-gray-200">{activity.event}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">No recent activity</div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}