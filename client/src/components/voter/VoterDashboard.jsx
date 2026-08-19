import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import api from "../../services/api";

function Reveal({ children, delay = 0, className = "" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transform transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const statCards = [
  {
    key: "votesCast",
    label: "Votes Cast",
    icon: CheckCheck,
    iconStyle: "bg-emerald-50 text-emerald-600",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    key: "activeElections",
    label: "Active Elections",
    icon: Vote,
    iconStyle: "bg-purple-50 text-purple-600",
    accent: "from-purple-600 to-blue-600",
  },
  {
    key: "bookmarks",
    label: "Saved Elections",
    icon: Bookmark,
    iconStyle: "bg-blue-50 text-blue-600",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    key: "totalPayments",
    label: "Total Payments",
    icon: CreditCard,
    iconStyle: "bg-amber-50 text-amber-600",
    accent: "from-amber-500 to-orange-500",
  },
];

export default function VoterDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    votesCast: 0,
    activeElections: 0,
    bookmarks: 0,
    totalPayments: 0,
  });

  const [liveElections, setLiveElections] = useState([]);
  const [activities, setActivities] = useState([]);
  const [visibleActivities, setVisibleActivities] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(false);

  const loadMore = () => setVisibleActivities((prev) => prev + 5);
  const collapse = () => setVisibleActivities(5);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      setPaymentError(false);

      try {
        const votesRes = await api.get("/users/me/votes");
        const votes = votesRes.data.votes || [];

        const votesCast = votes.reduce((sum, v) => sum + (v.quantity || 1), 0);

        const electionsRes = await api.get("/elections", {
          params: {
            status: "ACTIVE",
            limit: 3,
          },
        });

        const activeElections = electionsRes.data.elections || [];

        let payments = [];
        let totalPayments = 0;

        try {
          const paymentsRes = await api.get("/users/me/payments");

          payments = paymentsRes.data.payments || paymentsRes.data || [];

          if (!Array.isArray(payments)) {
            payments = [];
          }

          totalPayments = payments
            .filter((p) => p.status === "COMPLETED" || p.status === "SUCCESS")
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        } catch {
          setPaymentError(true);
          totalPayments = 0;
          payments = [];
        }

        let bookmarks = 0;

        try {
          const bookmarksRes = await api.get("/users/me/bookmarks");

          bookmarks = bookmarksRes.data.bookmarks?.length || 0;
        } catch {
          bookmarks = 0;
        }

        const activityList = [];

        votes.forEach((v) => {
          const candidateName = v.candidate?.user
            ? `${v.candidate.user.firstName} ${v.candidate.user.lastName}`
            : "a candidate";

          const electionTitle = v.election?.title || "an election";

          activityList.push({
            id: `vote-${v.id}`,
            type: "vote",
            action: `Voted for ${candidateName}`,
            details: `in ${electionTitle}`,
            timestamp: new Date(v.votedAt),
            icon: <CheckCheck size={16} className="text-emerald-600" />,
            bgColor: "bg-emerald-100",
          });
        });

        payments.forEach((p) => {
          if (p.status === "COMPLETED" || p.status === "SUCCESS") {
            const quantity = p.quantity || 1;
            const amount = p.amount || 0;

            activityList.push({
              id: `payment-${p.id}`,
              type: "payment",
              action: `Purchased ${quantity} vote${quantity > 1 ? "s" : ""}`,
              details: `रू ${amount.toLocaleString()}`,
              timestamp: new Date(p.createdAt || p.paidAt || Date.now()),
              icon: <CreditCard size={16} className="text-amber-600" />,
              bgColor: "bg-amber-100",
            });
          }
        });

        activityList.sort((a, b) => b.timestamp - a.timestamp);

        const recentActivities = activityList.slice(0, 10);

        setStats({
          votesCast,
          activeElections: activeElections.length,
          bookmarks,
          totalPayments,
        });

        setLiveElections(activeElections);
        setActivities(recentActivities);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);

        setError("Could not load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-purple-100" />
            <Loader2
              className="absolute inset-0 m-auto animate-spin text-purple-600"
              size={30}
            />
          </div>
          <p className="text-sm font-medium text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-red-500/5">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={24} />
          </div>
          <p className="font-semibold text-gray-900">Something went wrong</p>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const displayedActivities = activities.slice(0, visibleActivities);

  const hasMore = visibleActivities < activities.length;
  const allShown =
    visibleActivities >= activities.length && activities.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-200/30 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-200/30 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Reveal>
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                <TrendingUp size={13} />
                Voter Dashboard
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {user?.firstName || "User"}
                </span>{" "}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
                Here is what is happening across your elections today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/request-election"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-8 py-3.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:border-[#6D28D9] hover:text-[#6D28D9]"
              >
                <ShieldCheck size={18} />
                Create Election
              </Link>
              <Link
                to="/voter/elections"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/30"
              >
                <Vote size={16} />
                Browse Elections
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;

            const value =
              card.key === "totalPayments"
                ? stats.totalPayments > 0
                  ? `Rs ${stats.totalPayments.toLocaleString()}`
                  : "—"
                : stats[card.key];

            return (
              <Reveal key={card.key} delay={100 + index * 100}>
                <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-purple-100 hover:shadow-xl hover:shadow-gray-200/50">
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        {card.label}
                      </p>
                      <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900">
                        {value}
                      </h3>
                      {card.key === "totalPayments" && paymentError && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-500">
                          <AlertCircle size={11} />
                          Unable to fetch
                        </p>
                      )}
                    </div>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconStyle} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal delay={500}>
            <div className="h-full rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/40 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      Live Elections
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Elections currently accepting votes
                  </p>
                </div>
                <Link
                  to="/elections"
                  className="group inline-flex items-center gap-1 text-xs font-semibold text-purple-600 transition hover:text-purple-700"
                >
                  View all
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
              <div className="space-y-3">
                {liveElections.length > 0 ? (
                  liveElections.map((election, index) => (
                    <Link
                      to={`/elections/${election.id}`}
                      key={election.id}
                      style={{
                        transitionDelay: `${index * 70}ms`,
                      }}
                      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-100 hover:bg-white hover:shadow-lg"
                    >
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-md shadow-purple-500/20">
                        <Vote
                          size={20}
                          className="text-white transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {election.title}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={12} />
                          Ends {new Date(election.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 transition-all duration-300 group-hover:bg-emerald-100">
                        Vote
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center">
                    <Vote size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      No active elections at the moment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={600}>
            <div className="h-full rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/40 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Recent Activity
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Your latest voting activity
                  </p>
                </div>
                {activities.length > 0 && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
                    {activities.length} total
                  </span>
                )}
              </div>
              {activities.length > 0 ? (
                <div className="space-y-2">
                  {displayedActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      style={{
                        animationDelay: `${index * 60}ms`,
                      }}
                      className="group flex items-start gap-3 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-gray-100 hover:bg-gray-50"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${activity.bgColor} transition-transform duration-300 group-hover:scale-110`}
                      >
                        {activity.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-800">
                            {activity.action}
                          </p>
                          <span className="text-xs text-gray-400">
                            {activity.details}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <Clock size={11} className="text-gray-400" />
                          <span className="text-[11px] text-gray-400">
                            {activity.timestamp.toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {activity.type === "vote" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            <CheckCheck size={10} />
                            Vote
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                            <CreditCard size={10} />
                            Payment
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {hasMore && (
                    <button
                      onClick={loadMore}
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-xs font-semibold text-purple-600 transition-all duration-300 hover:bg-purple-50"
                    >
                      <ChevronDown size={15} />
                      See more activities (
                      {activities.length - visibleActivities} remaining)
                    </button>
                  )}
                  {allShown && activities.length > 5 && (
                    <button
                      onClick={collapse}
                      className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2.5 text-xs font-semibold text-gray-500 transition-all duration-300 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <ChevronUp size={15} />
                      Show less
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
                    <Clock size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    No activity yet
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Start voting or make a payment to see activities here.
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
