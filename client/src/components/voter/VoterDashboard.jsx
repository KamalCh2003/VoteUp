// src/pages/VoterDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Vote,
  Bookmark,
  CreditCard,
  CheckCheck,
  Bell,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  TrendingUp,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';

export default function VoterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ votesCast: 0, activeElections: 0, bookmarks: 0, totalPayments: 0 });
  const [liveElections, setLiveElections] = useState([]);
  const [activities, setActivities] = useState([]);
  const [visibleActivities, setVisibleActivities] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(false);

  const loadMore = () => setVisibleActivities(prev => prev + 5);
  const collapse = () => setVisibleActivities(5);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      setPaymentError(false);

      try {
        // 1. Votes
        const votesRes = await api.get('/users/me/votes');
        const votes = votesRes.data.votes || [];
const votesCast = votes.reduce((sum, v) => sum + (v.quantity || 1), 0);
        // 2. Active elections
        const electionsRes = await api.get('/elections', {
          params: { status: 'ACTIVE', limit: 3 },
        });
        const activeElections = electionsRes.data.elections || [];

        // 3. Payments – with robust error handling
        let payments = [];
        let totalPayments = 0;
        try {
          const paymentsRes = await api.get('/users/me/payments');
          // Handle different response structures: { payments: [] } or [] directly
          payments = paymentsRes.data.payments || paymentsRes.data || [];
          if (!Array.isArray(payments)) payments = [];

          totalPayments = payments
            .filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        } catch (err) {
          console.warn('Payments endpoint not available or error:', err);
          setPaymentError(true);
          // Fallback: try to get payments from vote history? Not reliable, but we can use 0.
          totalPayments = 0;
          payments = [];
        }

        // 4. Bookmarks
        let bookmarks = 0;
        try {
          const bookmarksRes = await api.get('/users/me/bookmarks');
          bookmarks = bookmarksRes.data.bookmarks?.length || 0;
        } catch (err) {
          console.warn('Bookmarks endpoint not available:', err);
        }

        // ─── Build activity timeline ────────────────────────────────
        const activityList = [];

        // Vote activities
        votes.forEach(v => {
          const candidateName = v.candidate?.user
            ? `${v.candidate.user.firstName} ${v.candidate.user.lastName}`
            : 'a candidate';
          const electionTitle = v.election?.title || 'an election';
          activityList.push({
            id: `vote-${v.id}`,
            type: 'vote',
            action: `Voted for ${candidateName}`,
            details: `in ${electionTitle}`,
            timestamp: new Date(v.votedAt),
            icon: <CheckCheck size={16} className="text-emerald-600" />,
            bgColor: 'bg-emerald-100',
            textColor: 'text-emerald-700',
          });
        });

        // Payment activities
        payments.forEach(p => {
          if (p.status === 'COMPLETED' || p.status === 'SUCCESS') {
            const quantity = p.quantity || 1;
            const amount = p.amount || 0;
            activityList.push({
              id: `payment-${p.id}`,
              type: 'payment',
              action: `Purchased ${quantity} vote${quantity > 1 ? 's' : ''}`,
              details: `रू ${amount.toLocaleString()}`,
              timestamp: new Date(p.createdAt || p.paidAt || Date.now()),
              icon: <CreditCard size={16} className="text-amber-600" />,
              bgColor: 'bg-amber-100',
              textColor: 'text-amber-700',
            });
          }
        });

        // Sort by timestamp descending (newest first)
        activityList.sort((a, b) => b.timestamp - a.timestamp);

        setStats({
          votesCast,
          activeElections: activeElections.length,
          bookmarks,
          totalPayments,
        });
        setLiveElections(activeElections);
        setActivities(activityList);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Could not load dashboard. Please try again.');
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

  const displayedActivities = activities.slice(0, visibleActivities);
  const hasMore = visibleActivities < activities.length;
  const allShown = visibleActivities >= activities.length && activities.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
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

      {/* Stats Cards */}
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
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalPayments > 0 ? `Rs ${stats.totalPayments.toLocaleString()}` : '—'}
              </h3>
              {paymentError && (
                <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> Unable to fetch
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <CreditCard size={22} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Live Elections + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Elections */}
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

        {/* Recent Activity – Modern Timeline */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            {activities.length > 0 && (
              <span className="text-xs text-gray-500">{activities.length} total</span>
            )}
          </div>

          {activities.length > 0 ? (
            <div className="space-y-4">
              {displayedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                >
                  <div className={`p-2 rounded-full ${activity.bgColor} flex-shrink-0`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800">{activity.action}</p>
                      <span className="text-xs text-gray-500">{activity.details}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {activity.timestamp.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {activity.type === 'vote' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                        <CheckCheck size={10} /> Vote
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                        <CreditCard size={10} /> Payment
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* See more / See less buttons */}
              {hasMore && (
                <button
                  onClick={loadMore}
                  className="w-full mt-2 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition flex items-center justify-center gap-1"
                >
                  <ChevronDown size={16} /> See more activities ({activities.length - visibleActivities} remaining)
                </button>
              )}
              {allShown && activities.length > 5 && (
                <button
                  onClick={collapse}
                  className="w-full mt-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition flex items-center justify-center gap-1"
                >
                  <ChevronUp size={16} /> Show less
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock size={32} className="mx-auto mb-2 opacity-40" />
              <p>No activity yet.</p>
              <p className="text-xs">Start voting or make a payment to see activities here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}