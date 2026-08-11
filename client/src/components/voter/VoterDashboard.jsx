import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Vote, Bookmark, CreditCard, CheckCheck, Bell, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function VoterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ votesCast: 0, activeElections: 0, bookmarks: 0, totalPayments: 0 });
  const [liveElections, setLiveElections] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch vote history to get count and recent activity
        const votesRes = await api.get('/users/me/votes');
        const votes = votesRes.data.votes || [];
        const votesCast = votes.length;

        // 2. Fetch active elections (limit 3)
        const electionsRes = await api.get('/elections', {
          params: { status: 'ACTIVE', limit: 3 },
        });
        const activeElections = electionsRes.data.elections || [];

        // 3. Fetch payment history to get total payments
        let totalPayments = 0;
        try {
          const paymentsRes = await api.get('/users/me/payments');
          const payments = paymentsRes.data.payments || [];
          totalPayments = payments
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + p.amount, 0);
        } catch (err) {
          // If payments endpoint doesn't exist, fallback to 0
          console.warn('Payments endpoint not available:', err);
        }

        // 4. Bookmarks – if endpoint exists, fetch; else use 0
        let bookmarks = 0;
        try {
          const bookmarksRes = await api.get('/users/me/bookmarks');
          bookmarks = bookmarksRes.data.bookmarks?.length || 0;
        } catch (err) {
          console.warn('Bookmarks endpoint not available:', err);
        }

        // 5. Recent activity – map recent votes
        const recent = votes.slice(0, 5).map(v => ({
          id: v.id,
          action: `Voted for ${v.candidate?.user?.firstName || 'candidate'} in ${v.election?.title || 'election'}`,
          time: v.votedAt,
        }));

        setStats({
          votesCast,
          activeElections: activeElections.length,
          bookmarks,
          totalPayments,
        });
        setLiveElections(activeElections);
        setRecentActivity(recent);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Could not load dashboard. Please try again.');
        // Fallback to static data for demo
        setStats({ votesCast: 0, activeElections: 0, bookmarks: 0, totalPayments: 0 });
        setLiveElections([]);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || 'User'} 👋</h1>
          <p className="text-gray-500 text-sm">Here is what is happening across your elections today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/voter/notifications" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            <Bell size={16} /> Notifications
          </Link>
          <Link to="/voter/elections" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-105">
            <Vote size={16} /> Browse Elections
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Votes Cast</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.votesCast}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCheck size={22} className="text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Active Elections</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.activeElections}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Vote size={22} className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Saved Elections</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.bookmarks}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Bookmark size={22} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Payments</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">Rs {stats.totalPayments.toLocaleString()}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <CreditCard size={22} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Elections</h3>
            <Link to="/elections" className="text-sm font-semibold text-purple-600 hover:text-purple-700">View all</Link>
          </div>
          <div className="space-y-4">
            {liveElections.length > 0 ? (
              liveElections.map(e => (
                <Link to={`/elections/${e.id}`} key={e.id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{e.title}</p>
                    <p className="text-xs text-gray-500">Ends {new Date(e.endDate).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold">Vote</span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No active elections at the moment.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-2.5 top-1 w-3 h-3 rounded-full bg-purple-600 border-2 border-white"></div>
                  <p className="text-sm text-gray-800 font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{new Date(activity.time).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}