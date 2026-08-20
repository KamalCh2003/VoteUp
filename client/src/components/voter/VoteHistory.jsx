import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Loader2,
  Calendar,
  User,
  Hash,
  Wallet,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Vote,
  CheckCircle2,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatADtoBSLong } from '../../utils/date';

export default function VoteHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVoteHistory();
  }, []);

  const fetchVoteHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/me/votes');
      setHistory(data.votes || []);
      setError(null);
    } catch (err) {
      setError('Could not load your voting history.');
    } finally {
      setLoading(false);
    }
  };

  const formatNepaliDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    const bsDate = formatADtoBSLong(date);
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${bsDate}, ${time}`;
  };

  const getVoteType = (votePrice) => (votePrice === 0 ? 'Free' : 'Paid');

  const calculateSpend = (votePrice, quantity) =>
    votePrice === 0 ? '—' : `रू ${(votePrice * quantity).toLocaleString()}`;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const totalVotes = history.reduce((sum, vote) => sum + (vote.quantity || 1), 0);
  const paidVotes = history.filter((vote) => (vote.election?.votePrice ?? 0) > 0).length;
  const freeVotes = history.filter((vote) => (vote.election?.votePrice ?? 0) === 0).length;
  const totalSpent = history.reduce((sum, vote) => {
    const price = vote.election?.votePrice ?? 0;
    return sum + price * (vote.quantity || 1);
  }, 0);

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
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
          <p className="text-sm font-medium text-gray-500">Loading your votes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-red-500/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <Vote size={25} className="text-red-500" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-gray-900">Unable to load history</h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <button
            onClick={fetchVoteHistory}
            className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="relative min-h-[70vh] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-200/30 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-200/30 blur-[120px]" />
        <div className="relative flex min-h-[70vh] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl shadow-purple-500/20">
              <Vote size={34} className="text-white" />
            </div>
            <h1 className="mt-7 text-3xl font-extrabold tracking-tight text-gray-900">
              No votes yet
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Your voting activity will appear here once you participate in an election.
            </p>
            <Link
              to="/elections"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              Explore elections
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-purple-200/30 blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-[140px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
              <Vote size={13} />
              Activity
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Voting History
            </h1>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Track your votes and election participation.
            </p>
          </div>
          <Link
            to="/elections"
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Browse Elections
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <SummaryCard
            icon={Vote}
            label="Total Votes"
            value={totalVotes}
            iconClass="bg-purple-50 text-purple-600"
            delay="0ms"
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Elections"
            value={history.length}
            iconClass="bg-emerald-50 text-emerald-600"
            delay="80ms"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Paid Votes"
            value={paidVotes}
            iconClass="bg-amber-50 text-amber-600"
            delay="160ms"
          />
          <SummaryCard
            icon={Wallet}
            label="Total Spent"
            value={totalSpent > 0 ? `रू ${totalSpent.toLocaleString()}` : '—'}
            iconClass="bg-blue-50 text-blue-600"
            delay="240ms"
          />
        </div>

        <div className="hidden overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm transition-shadow duration-500 hover:shadow-xl hover:shadow-gray-200/40 md:block">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">All Votes</h2>
              <p className="mt-1 text-xs text-gray-500">
                {history.length} voting records
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {freeVotes} Free
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {paidVotes} Paid
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Election
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Candidate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Spend
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((vote) => {
                  const votePrice = vote.election?.votePrice ?? 0;
                  const spend = calculateSpend(votePrice, vote.quantity || 1);
                  const voteType = getVoteType(votePrice);
                  const name =
                    `${vote.candidate?.user?.firstName || ''} ${vote.candidate?.user?.lastName || ''}`.trim() ||
                    'Unknown';

                  return (
                    <tr
                      key={vote.id}
                      className="group border-b border-gray-100 last:border-0 transition-all duration-300 hover:bg-purple-50/30"
                    >
                      <td className="px-6 py-5">
                        <div className="max-w-[220px]">
                          <p className="truncate font-semibold text-gray-900">
                            {vote.election?.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {vote.candidate?.avatarUrl ? (
                            <img
                              src={vote.candidate.avatarUrl}
                              alt={name}
                              className="h-9 w-9 rounded-xl object-cover ring-2 ring-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                              <User size={16} className="text-gray-400" />
                            </div>
                          )}
                          <span className="font-medium text-gray-700">{name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <VoteTypeBadge type={voteType} />
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
                          {vote.quantity || 1}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-semibold text-gray-800">{spend}</td>
                      <td className="whitespace-nowrap px-6 py-5 text-gray-500">
                        {formatNepaliDate(vote.votedAt)}
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          <CheckCircle2 size={12} />
                          Counted
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, history.length)} of {history.length}{' '}
                entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition ${ 
                        page === currentPage
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                          : 'border border-gray-200 bg-white text-gray-500 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 md:hidden">
          {paginatedHistory.map((vote) => {
            const votePrice = vote.election?.votePrice ?? 0;
            const spend = calculateSpend(votePrice, vote.quantity || 1);
            const voteType = getVoteType(votePrice);
            const name =
              `${vote.candidate?.user?.firstName || ''} ${vote.candidate?.user?.lastName || ''}`.trim() ||
              'Unknown';
            const isExpanded = expandedId === vote.id;

            return (
              <div
                key={vote.id}
                className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <button
                  onClick={() => toggleExpand(vote.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors duration-300 hover:bg-gray-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {vote.candidate?.avatarUrl ? (
                      <img
                        src={vote.candidate.avatarUrl}
                        alt={name}
                        className="h-11 w-11 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-blue-50">
                        <User size={18} className="text-purple-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {vote.election?.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-500">{name}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <VoteTypeBadge type={voteType} />
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Detail icon={User} label="Candidate" value={name} />
                        <Detail icon={TrendingUp} label="Type" value={`${voteType} Vote`} />
                        <Detail icon={Hash} label="Quantity" value={vote.quantity || 1} />
                        <Detail icon={Wallet} label="Spend" value={spend} />
                        <Detail icon={Calendar} label="Date" value={formatNepaliDate(vote.votedAt)} full />
                        <Detail icon={CheckCircle2} label="Status" value="Counted" full />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, iconClass, delay }) {
  return (
    <div
      style={{ animationDelay: delay }}
      className="group animate-[fadeUp_0.7s_ease-out_both] rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-purple-100 hover:shadow-xl hover:shadow-gray-200/50 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function VoteTypeBadge({ type }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        type === 'Free'
          ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
          : 'border border-amber-100 bg-amber-50 text-amber-700'
      }`}
    >
      {type}
    </span>
  );
}

function Detail({ icon: Icon, label, value, full = false }) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white p-3 ${full ? 'col-span-2' : ''}`}
    >
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        <Icon size={12} />
        {label}
      </div>
      <p className="truncate text-xs font-semibold text-gray-700">{value}</p>
    </div>
  );
}