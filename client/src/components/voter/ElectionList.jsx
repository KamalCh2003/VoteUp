// src/components/voter/ElectionList.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Activity, Archive, Search, Filter, Calendar, ChevronRight, Bookmark, CheckCheck, SortAsc, SortDesc, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const BANNER_COLORS = [
  'linear-gradient(135deg,#6D28D9,#2563EB)',
  'linear-gradient(135deg,#EF4444,#F59E0B)',
  'linear-gradient(135deg,#DB2777,#6D28D9)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#2563EB,#06B6D4)',
  'linear-gradient(135deg,#15803D,#22C55E)',
  'linear-gradient(135deg,#0F172A,#2563EB)',
  'linear-gradient(135deg,#6D28D9,#06B6D4)',
];

export default function ElectionList() {
  const { user } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});
  const [categories, setCategories] = useState([]);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [votedElections, setVotedElections] = useState(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const [candidateCounts, setCandidateCounts] = useState({});

  const getTimeRemaining = (endDate) => {
    const total = Date.parse(endDate) - Date.now();
    if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      total,
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / (1000 * 60)) % 60),
      seconds: Math.floor((total / 1000) % 60),
    };
  };

  const formatCountdown = (time) => {
    if (time.total <= 0) return 'Ended';
    const parts = [];
    if (time.days > 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);
    parts.push(`${time.seconds}s`);
    return parts.join(' ');
  };

  const fetchElections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/elections');
      const all = res.data.elections || [];
      setElections(all);

      const cats = new Set();
      all.forEach(e => { if (e.category) cats.add(e.category); });
      setCategories(Array.from(cats));

      const initial = {};
      all.filter(e => e.status === 'ACTIVE').forEach(e => {
        initial[e.id] = getTimeRemaining(e.endDate);
      });
      setTimeLeft(initial);

      const countPromises = all.map(election =>
        api.get(`/elections/${election.id}`)
          .then(res => ({ id: election.id, count: res.data.election.candidates?.length || 0 }))
          .catch(() => ({ id: election.id, count: 0 }))
      );
      const countResults = await Promise.all(countPromises);
      const counts = {};
      countResults.forEach(r => counts[r.id] = r.count);
      setCandidateCounts(counts);

      if (user) {
        try {
          const votesRes = await api.get('/users/me/votes');
          const votedIds = new Set();
          (votesRes.data.votes || []).forEach(v => {
            if (v.electionId) votedIds.add(v.electionId);
          });
          setVotedElections(votedIds);
        } catch (err) {
          console.warn('Could not fetch voted elections:', err);
        }
      }
    } catch (err) {
      console.error('Failed to fetch elections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    if (!elections.length) return;
    const active = elections.filter(e => e.status === 'ACTIVE');
    if (!active.length) return;
    const interval = setInterval(() => {
      const updated = {};
      active.forEach(e => {
        updated[e.id] = getTimeRemaining(e.endDate);
      });
      setTimeLeft(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [elections]);

  const toggleBookmark = async (electionId, e) => {
    e.stopPropagation();
    try {
      if (bookmarks.has(electionId)) {
        await api.delete(`/users/me/bookmarks/${electionId}`);
        bookmarks.delete(electionId);
        toast.success('Removed from bookmarks');
      } else {
        await api.post(`/users/me/bookmarks/${electionId}`);
        bookmarks.add(electionId);
        toast.success('Added to bookmarks');
      }
      setBookmarks(new Set(bookmarks));
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const getStatusFromTab = (tab) => {
    switch (tab) {
      case 'LIVE': return 'ACTIVE';
      case 'UPCOMING': return 'UPCOMING';
      case 'COMPLETED': return 'ENDED';
      default: return null;
    }
  };

  const filtered = elections
    .filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                            e.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || e.category === category;
      const matchesDate = !dateFilter ||
                          new Date(e.startDate).toISOString().split('T')[0] === dateFilter ||
                          new Date(e.endDate).toISOString().split('T')[0] === dateFilter;
      const statusFromTab = getStatusFromTab(activeTab);
      const matchesStatus = !statusFromTab || e.status === statusFromTab;
      const matchesBookmark = !showBookmarkedOnly || bookmarks.has(e.id);
      return matchesSearch && matchesCategory && matchesDate && matchesStatus && matchesBookmark;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.startDate) - new Date(a.startDate);
        case 'endingSoon':
          return new Date(a.endDate) - new Date(b.endDate);
        case 'mostVotes':
          return (b.totalVotes || 0) - (a.totalVotes || 0);
        case 'priceLow':
          return (a.votePrice || 0) - (b.votePrice || 0);
        case 'priceHigh':
          return (b.votePrice || 0) - (a.votePrice || 0);
        default:
          return 0;
      }
    });

  const ElectionCard = ({ election, index }) => {
    const color = BANNER_COLORS[index % BANNER_COLORS.length];
    const remaining = timeLeft[election.id] || { total: 0 };
    const isActive = election.status === 'ACTIVE';
    const isUpcoming = election.status === 'UPCOMING';
    const isEnded = election.status === 'ENDED';
    const hasVotedInElection = votedElections.has(election.id);
    const isBookmarked = bookmarks.has(election.id);
    const candidateCount = candidateCounts[election.id] ?? election.candidates?.length ?? 0;
    const isFree = election.votePrice === 0;

    let actionLabel = 'View details';
    let actionClasses = 'text-xs text-gray-400';
    let showVotedBadge = false;

    if (isActive && user?.role === 'VOTER') {
      if (isFree && hasVotedInElection) {
        actionLabel = 'Voted';
        actionClasses = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200';
        showVotedBadge = true;
      } else if (isFree && !hasVotedInElection) {
        actionLabel = 'Vote Now';
        actionClasses = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium hover:shadow-md transition';
      } else {
        actionLabel = hasVotedInElection ? 'Vote Again' : 'Vote Now';
        actionClasses = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium hover:shadow-md transition';
        showVotedBadge = hasVotedInElection;
      }
    } else if (isEnded && hasVotedInElection) {
      actionLabel = 'Voted';
      actionClasses = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200';
      showVotedBadge = true;
    } else if (isEnded) {
      actionLabel = 'Ended';
      actionClasses = 'text-xs text-gray-400';
    } else if (isUpcoming) {
      actionLabel = 'Upcoming';
      actionClasses = 'text-xs text-gray-400';
    } else {
      actionLabel = 'View details';
      actionClasses = 'text-xs text-gray-400';
    }

    return (
      <div className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className="relative h-24 bg-gradient-to-r" style={{ background: color }}>
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isActive ? 'bg-emerald-600 text-white' :
              isUpcoming ? 'bg-amber-600 text-white' :
              'bg-gray-600 text-white'
            }`}>
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
              {isActive ? 'Live' : isUpcoming ? 'Upcoming' : 'Ended'}
            </span>
            {isFree && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-green-700 border border-green-200">Free</span>
            )}
            {!isFree && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-amber-700 border border-amber-200">रू {election.votePrice}</span>
            )}
          </div>
          <button
            onClick={(e) => toggleBookmark(election.id, e)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-violet-600 transition backdrop-blur-sm"
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark size={14} className={isBookmarked ? 'fill-violet-600 text-violet-600' : ''} />
          </button>
        </div>

        <Link to={`/elections/${election.id}`} className="block p-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-violet-600 transition line-clamp-1">{election.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{election.category}</p>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span><span className="font-semibold text-gray-700">{candidateCount}</span> candidates</span>
              <span>Ends {new Date(election.endDate).toLocaleDateString()}</span>
            </div>
            {isActive && (
              <span className="text-cyan-600 font-mono text-xs flex items-center gap-1">
                <Clock size={12} />
                {remaining.total > 0 ? formatCountdown(remaining) : 'Ended'}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            {actionLabel === 'Vote Now' || actionLabel === 'Vote Again' ? (
              <span className={actionClasses}>
                {actionLabel} <ChevronRight size={14} />
              </span>
            ) : actionLabel === 'Voted' ? (
              <span className={actionClasses}>
                <CheckCheck size={14} /> {actionLabel}
              </span>
            ) : (
              <span className={actionClasses}>{actionLabel}</span>
            )}
            {showVotedBadge && actionLabel !== 'Voted' && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                <CheckCheck size={10} /> Voted
              </span>
            )}
            <ChevronRight size={16} className="text-gray-400 group-hover:text-violet-600 transition group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    );
  };

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
          <p className="text-sm font-medium text-gray-500">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-900">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-violet-200/40 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-200/40 blur-[140px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Browse Elections</h1>
          <p className="text-gray-500 mt-1">
            Discover and vote in active elections. Save your favorites and track your voting history.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search elections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
            />
          </div>

          <div className="hidden md:flex items-center gap-3 flex-wrap">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-violet-500 outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-violet-500 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="endingSoon">Ending Soon</option>
              <option value="mostVotes">Most Votes</option>
              <option value="priceLow">Price: Low–High</option>
              <option value="priceHigh">Price: High–Low</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:border-violet-500 outline-none"
            />
          </div>

          <button
            onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
              showBookmarkedOnly
                ? 'bg-violet-100 text-violet-700 border border-violet-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            <Bookmark size={16} className={showBookmarkedOnly ? 'fill-violet-600 text-violet-600' : ''} />
            <span>Bookmarked</span>
            {bookmarks.size > 0 && (
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                showBookmarkedOnly ? 'bg-violet-200 text-violet-800' : 'bg-gray-200 text-gray-700'
              }`}>
                {bookmarks.size}
              </span>
            )}
          </button>

          {(search || category || statusFilter !== 'ALL' || dateFilter || showBookmarkedOnly || sortBy !== 'newest') && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setStatusFilter('ALL'); setDateFilter(''); setShowBookmarkedOnly(false); setSortBy('newest'); }}
              className="px-3 py-2 text-sm text-violet-600 hover:text-violet-700 transition"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex gap-1 mb-8 border-b border-gray-200 overflow-x-auto">
          {['ALL', 'LIVE', 'UPCOMING', 'COMPLETED'].map((tab) => {
            const label = tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase();
            const count = elections.filter(e => {
              if (tab === 'ALL') return true;
              if (tab === 'LIVE') return e.status === 'ACTIVE';
              if (tab === 'UPCOMING') return e.status === 'UPCOMING';
              if (tab === 'COMPLETED') return e.status === 'ENDED';
              return false;
            }).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition ${
                  activeTab === tab
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((election, idx) => (
              <ElectionCard key={election.id} election={election} index={idx} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-500">No elections found matching your filters.</div>
        )}
      </div>
    </div>
  );
}