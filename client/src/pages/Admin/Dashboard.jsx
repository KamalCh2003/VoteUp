import { useState, useEffect } from "react";
import API from "../../services/api";
import {
  Users,
  Vote,
  UserCheck,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";

const iconMap = {
  Users: Users,
  Vote: Vote,
  Calendar: Calendar,
  UserCheck: UserCheck,
  Activity: Activity,
};

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCandidates: 0,
    totalElections: 0,
    activeElections: 0,
    upcomingElections: 0,
    endedElections: 0,
    totalVotes: 0,
    voterTurnout: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/admin/stats/dashboard');
        const data = response.data.data;
        
        setStats({
          totalUsers: data.totalUsers,
          totalCandidates: data.totalCandidates,
          totalElections: data.totalElections,
          activeElections: data.activeElections,
          upcomingElections: data.upcomingElections,
          endedElections: data.endedElections,
          totalVotes: data.totalVotes,
          voterTurnout: data.voterTurnout,
        });
        
        // Map recent activities with icon components
        const activities = data.recentActivities.map(activity => ({
          id: activity.id,
          action: activity.action,
          time: activity.time,
          icon: iconMap[activity.icon] || Activity,
          user: activity.user,
        }));
        setRecentActivities(activities);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        setError("Could not load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Monitor platform activity and election statistics in real-time.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Users className="text-purple-400" size={24} />
            </div>
          </div>
        </div>

        {/* Total Votes */}
        <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Votes Cast</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalVotes.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Vote className="text-green-400" size={24} />
            </div>
          </div>
        </div>

        {/* Total Candidates */}
        <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Candidates</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalCandidates}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <UserCheck className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        {/* Voter Turnout */}
        <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Voter Turnout</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.voterTurnout}%</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <TrendingUp className="text-yellow-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Election Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-purple-400" />
            Election Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active</span>
              <span className="text-white font-bold">{stats.activeElections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Upcoming</span>
              <span className="text-white font-bold">{stats.upcomingElections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Ended</span>
              <span className="text-white font-bold">{stats.endedElections}</span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-[#0B1020] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-400" />
            Recent Activities
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-white/5">
                    <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <Icon size={16} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-xs">{activity.time}</p>
                        {activity.user && activity.user !== "System" && (
                          <span className="text-gray-500 text-xs">by {activity.user}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">No recent activities</div>
            )}
          </div>
        </div>
      </div>

      {/* Voting Trends (chart placeholder) */}
      <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Voting Trends (Last 7 Days)</h3>
        <div className="h-64 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-gray-500">
          Chart integration here (e.g., Recharts, Chart.js)
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;