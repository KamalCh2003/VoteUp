import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  Loader2,
  Crown,
  BarChart3,
  RefreshCw,
  Medal,
  TrendingUp,
  CircleCheck,
  Activity,
  Eye,
} from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function Leaderboard() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const electionIdFromQuery = searchParams.get("election");

  const [activeElections, setActiveElections] = useState([]);
  const [endedElections, setEndedElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publishing, setPublishing] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  const getTimeRemaining = useCallback((endDate) => {
    const total = Date.parse(endDate) - Date.now();
    if (total <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { total, days, hours, minutes, seconds };
  }, []);

  const formatCountdown = (time) => {
    if (!time || time.total <= 0) return "Ended";
    const parts = [];
    if (time.days > 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);
    parts.push(`${time.seconds}s`);
    return parts.join(" ");
  };

  const loadElectionDetails = async (electionId) => {
    try {
      setRefreshing(true);
      const { data } = await api.get(`/elections/${electionId}`);
      const election = data.election;
      const sortedCandidates = [...(election.candidates || [])].sort(
        (a, b) => (b.votesReceived || 0) - (a.votesReceived || 0),
      );
      setSelectedElection(election);
      setRankedCandidates(sortedCandidates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch election details:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAllElections = useCallback(async () => {
    try {
      const [activeRes, endedRes] = await Promise.all([
        api.get("/elections", { params: { status: "ACTIVE" } }),
        api.get("/elections", { params: { status: "ENDED" } }),
      ]);
      let active = activeRes.data.elections || [];
      let ended = endedRes.data.elections || [];
      active = [...active].sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate),
      );
      ended = [...ended].sort(
        (a, b) => new Date(b.endDate) - new Date(a.endDate),
      );
      setActiveElections(active);
      setEndedElections(ended);
      const countdowns = {};
      active.forEach((election) => {
        countdowns[election.id] = getTimeRemaining(election.endDate);
      });
      setTimeLeft(countdowns);
      setLastUpdated(new Date());
      if (!selectedElection) {
        const firstElection =
          ended.length > 0 ? ended[0] : active.length > 0 ? active[0] : null;
        if (firstElection) {
          await loadElectionDetails(firstElection.id);
        }
      }
    } catch (error) {
      console.error("Failed to load elections:", error);
    }
  }, [getTimeRemaining, selectedElection]);

  const handlePublish = async (electionId) => {
    if (!window.confirm("Publish results for this election? Voters will then be able to see the results.")) return;
    setPublishing(electionId);
    try {
      await api.patch(`/elections/${electionId}/publish`);
      toast.success("Results published successfully!");
      // Refresh the election list and reload the selected election
      await fetchAllElections();
      if (selectedElection?.id === electionId) {
        await loadElectionDetails(electionId);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to publish results");
    } finally {
      setPublishing(null);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await fetchAllElections();
      setLoading(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    if (electionIdFromQuery) {
      loadElectionDetails(electionIdFromQuery);
    }
  }, [electionIdFromQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllElections();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllElections]);

  useEffect(() => {
    if (!activeElections.length) return;
    const interval = setInterval(() => {
      const updated = {};
      activeElections.forEach((election) => {
        updated[election.id] = getTimeRemaining(election.endDate);
      });
      setTimeLeft(updated);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeElections, getTimeRemaining]);

  const totalVotes = useMemo(() => {
    return rankedCandidates.reduce(
      (total, candidate) => total + (candidate.votesReceived || 0),
      0,
    );
  }, [rankedCandidates]);

  const maxVotes = useMemo(() => {
    if (!rankedCandidates.length) return 1;
    return Math.max(
      ...rankedCandidates.map((candidate) => candidate.votesReceived || 0),
    );
  }, [rankedCandidates]);

  const winner = rankedCandidates[0];
  const winnerPercentage =
    totalVotes > 0 && winner
      ? (((winner.votesReceived || 0) / totalVotes) * 100).toFixed(1)
      : "0.0";

  const CandidateAvatar = ({ candidate, large = false }) => {
    const initials = `${candidate?.user?.firstName?.[0] || ""}${
      candidate?.user?.lastName?.[0] || ""
    }`;
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm ${
          large
            ? "h-20 w-20 text-xl sm:h-24 sm:w-24 sm:text-2xl"
            : "h-11 w-11 text-sm"
        }`}
      >
        {candidate?.avatarUrl ? (
          <img
            src={candidate.avatarUrl}
            alt={`${candidate?.user?.firstName || ""} ${
              candidate?.user?.lastName || ""
            }`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-bold">{initials || "?"}</span>
        )}
      </div>
    );
  };

  const ElectionCard = ({ election, active = false }) => {
    const isSelected = selectedElection?.id === election.id;
    const remaining = active ? timeLeft[election.id] : null;
    const isPublished = !!election.resultsPublishedAt;

    return (
      <button
        type="button"
        onClick={() => loadElectionDetails(election.id)}
        className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
          isSelected
            ? "border-violet-300 bg-violet-50 shadow-sm shadow-violet-100"
            : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              isSelected
                ? "bg-violet-600 text-white"
                : active
                  ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                  : "bg-gray-100 text-gray-500 group-hover:bg-violet-50 group-hover:text-violet-600"
            }`}
          >
            {active ? <Activity size={18} /> : <Trophy size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {election.title}
              </h3>
              {active ? (
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  LIVE
                </span>
              ) : (
                <ChevronRight
                  size={15}
                  className={`shrink-0 text-gray-300 transition ${
                    isSelected
                      ? "translate-x-1 text-violet-500"
                      : "group-hover:text-violet-500"
                  }`}
                />
              )}
            </div>
            <p className="mt-1 truncate text-xs text-gray-500">
              {election.category || "General Election"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {active
                  ? `Ends ${new Date(election.endDate).toLocaleDateString()}`
                  : `Ended ${new Date(election.endDate).toLocaleDateString()}`}
              </span>
              {!active && (
                <>
                  <span className="h-3 w-px bg-gray-200" />
                  {isPublished ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                      <CircleCheck size={10} /> Published
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublish(election.id);
                      }}
                      disabled={publishing === election.id}
                      className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-violet-700 transition disabled:opacity-50"
                    >
                      {publishing === election.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Eye size={10} />
                      )}
                      Publish
                    </button>
                  )}
                </>
              )}
            </div>
            {active && remaining?.total > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-cyan-600">
                <Clock size={12} />
                {formatCountdown(remaining)}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderPodium = () => {
    if (!rankedCandidates.length) return null;
    const first = rankedCandidates[0];
    const second = rankedCandidates[1];
    const third = rankedCandidates[2];

    const PodiumCandidate = ({ candidate, rank, featured = false }) => {
      if (!candidate) return null;
      const votes = candidate.votesReceived || 0;
      const percentage =
        totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : "0.0";
      return (
        <div
          className={`relative flex flex-col items-center ${
            featured
              ? "order-1 -mt-5 sm:order-2"
              : rank === 2
                ? "order-2 sm:order-1"
                : "order-3"
          }`}
        >
          {featured && (
            <div className="absolute -top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg">
              <Crown size={16} />
            </div>
          )}
          <div
            className={`rounded-full p-1 ${
              featured
                ? "bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 shadow-xl shadow-amber-100"
                : rank === 2
                  ? "bg-gradient-to-br from-gray-300 to-gray-500"
                  : "bg-gradient-to-br from-orange-400 to-amber-700"
            }`}
          >
            <CandidateAvatar candidate={candidate} large />
          </div>
          <div className="mt-3 text-center">
            <p className="max-w-[140px] truncate text-sm font-bold text-gray-950">
              {candidate.user?.firstName} {candidate.user?.lastName}
            </p>
            <p className="mt-1 max-w-[140px] truncate text-xs text-gray-400">
              {candidate.party || "Independent"}
            </p>
            <div className="mt-3">
              <p className="text-lg font-bold text-gray-950">
                {votes.toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-400">
                {percentage}% of votes
              </p>
            </div>
          </div>
          <div
            className={`mt-4 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${
              featured
                ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                : rank === 2
                  ? "bg-gradient-to-br from-gray-400 to-gray-500"
                  : "bg-gradient-to-br from-orange-500 to-amber-700"
            }`}
          >
            {rank}
          </div>
        </div>
      );
    };

    return (
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-96 -translate-x-1/2 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="relative border-b border-gray-100 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Trophy size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                Final Standings
              </p>
              <h3 className="font-bold text-gray-950">Top Performers</h3>
            </div>
          </div>
        </div>
        <div className="relative flex items-end justify-center gap-5 px-5 pb-8 pt-12 sm:gap-14 sm:px-10 sm:pt-14">
          <PodiumCandidate candidate={second} rank={2} />
          <PodiumCandidate candidate={first} rank={1} featured />
          <PodiumCandidate candidate={third} rank={3} />
        </div>
      </div>
    );
  };

  const renderFullLeaderboard = () => {
    return (
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-7">
          <div>
            <h3 className="font-bold text-gray-950">Full Leaderboard</h3>
            <p className="mt-1 text-xs text-gray-400">
              Final ranking by total votes received
            </p>
          </div>
          {refreshing && (
            <RefreshCw size={16} className="animate-spin text-violet-500" />
          )}
        </div>
        <div className="divide-y divide-gray-100">
          {rankedCandidates.map((candidate, index) => {
            const rank = index + 1;
            const votes = candidate.votesReceived || 0;
            const percentage =
              totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : "0.0";
            const widthPercent = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
            const isWinner = rank === 1;
            return (
              <div
                key={candidate.id}
                className={`group px-5 py-5 transition sm:px-7 ${
                  isWinner ? "bg-violet-50/40" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex w-8 shrink-0 justify-center">
                    {rank === 1 ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-sm">
                        <Crown size={17} />
                      </div>
                    ) : rank === 2 ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 text-sm font-bold text-white">
                        2
                      </div>
                    ) : rank === 3 ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-700 text-sm font-bold text-white">
                        3
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-400">
                        {String(rank).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <CandidateAvatar candidate={candidate} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {candidate.user?.firstName} {candidate.user?.lastName}
                      </p>
                      {isWinner && (
                        <span className="hidden rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 sm:inline">
                          WINNER
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {candidate.party || "Independent"}
                    </p>
                    <div className="mt-3 hidden items-center gap-3 sm:flex">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isWinner
                              ? "bg-gradient-to-r from-violet-500 to-indigo-500"
                              : "bg-gray-300"
                          }`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-[11px] font-medium text-gray-400">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-base font-bold text-gray-950 sm:text-lg">
                      {votes.toLocaleString()}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400">
                      votes
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 sm:hidden">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${
                        isWinner
                          ? "bg-gradient-to-r from-violet-500 to-indigo-500"
                          : "bg-gray-300"
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-gray-400">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
          {rankedCandidates.length === 0 && (
            <div className="px-6 py-14 text-center">
              <Medal size={30} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-500">
                No candidates found
              </p>
              <p className="mt-1 text-xs text-gray-400">
                There are no candidates available for this election.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSelectedElection = () => {
    if (!selectedElection) {
      return (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
            <Trophy size={25} />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">
            Select an election
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose an election to view its leaderboard.
          </p>
        </div>
      );
    }

    if (selectedElection.status === "ACTIVE") {
      const remaining =
        timeLeft[selectedElection.id] ||
        getTimeRemaining(selectedElection.endDate);
      return (
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 px-6 py-8 text-white shadow-lg sm:px-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                LIVE ELECTION
              </div>
              <h2 className="max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">
                {selectedElection.title}
              </h2>
              {selectedElection.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                  {selectedElection.description}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
                  <Calendar size={13} />
                  Ends {new Date(selectedElection.endDate).toLocaleDateString()}
                </span>
                {remaining.total > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
                    <Clock size={13} />
                    {formatCountdown(remaining)}
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs">
                  <Users size={13} />
                  {rankedCandidates.length} candidates
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
              <Activity size={30} />
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-950">
              Election is currently live
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Voting is still in progress. Final leaderboard results will become
              available once the election has ended.
            </p>
            <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-xl bg-gray-50 p-3 text-left">
              <CircleCheck size={18} className="shrink-0 text-emerald-500" />
              <p className="text-xs text-gray-500">
                The leaderboard will automatically update after the election is
                completed.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ENDED election
    const isPublished = !!selectedElection.resultsPublishedAt;
    return (
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950 px-6 py-7 text-white shadow-lg sm:px-8">
          <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold">
                <CircleCheck size={13} />
                ELECTION ENDED
              </span>
              {selectedElection.category && (
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white/70">
                  {selectedElection.category}
                </span>
              )}
              {/* Publish / Published button */}
              {isPublished ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                  <CircleCheck size={13} /> Published
                </span>
              ) : (
                <button
                  onClick={() => handlePublish(selectedElection.id)}
                  disabled={publishing === selectedElection.id}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-violet-700 transition disabled:opacity-50"
                >
                  {publishing === selectedElection.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Eye size={13} />
                  )}
                  Publish Results
                </button>
              )}
            </div>
            <h2 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">
              {selectedElection.title}
            </h2>
            {selectedElection.description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                {selectedElection.description}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                Ended {new Date(selectedElection.endDate).toLocaleDateString()}
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span className="flex items-center gap-1.5">
                <Users size={13} />
                {rankedCandidates.length} candidates
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span className="flex items-center gap-1.5">
                <BarChart3 size={13} />
                {totalVotes.toLocaleString()} total votes
              </span>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                Total Votes
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <BarChart3 size={17} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-950">
              {totalVotes.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-400">Across all candidates</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                Candidates
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={17} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-950">
              {rankedCandidates.length}
            </p>
            <p className="mt-1 text-xs text-gray-400">Final participants</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">
                Winner Share
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <TrendingUp size={17} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-950">
              {winnerPercentage}%
            </p>
            <p className="mt-1 truncate text-xs text-gray-400">
              {winner
                ? `${winner.user?.firstName || ""} ${
                    winner.user?.lastName || ""
                  }`
                : "No winner"}
            </p>
          </div>
        </div>
        {rankedCandidates.length > 0 && renderPodium()}
        {renderFullLeaderboard()}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-purple-100" />
            <Loader2
              className="absolute inset-0 m-auto animate-spin text-purple-600"
              size={30}
            />
          </div>
          <p className="text-sm font-medium text-gray-500">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                <Trophy size={14} />
                Election Analytics
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Leaderboard
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                Monitor election performance, compare candidates, and review
                final voting results from one place.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 sm:self-auto">
              <RefreshCw
                size={13}
                className={refreshing ? "animate-spin" : ""}
              />
              Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "--:--"}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="grid gap-7 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside>
            <div className="lg:sticky lg:top-6">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Elections
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Select an election to view its leaderboard.
                </p>
              </div>
              {activeElections.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      Ongoing
                    </h3>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                      {activeElections.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {activeElections.map((election) => (
                      <ElectionCard
                        key={election.id}
                        election={election}
                        active
                      />
                    ))}
                  </div>
                </div>
              )}
              {endedElections.length > 0 && (
                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <Trophy size={13} />
                      Past Elections
                    </h3>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500">
                      {endedElections.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {endedElections.map((election) => (
                      <ElectionCard key={election.id} election={election} />
                    ))}
                  </div>
                </div>
              )}
              {activeElections.length === 0 && endedElections.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center">
                  <Trophy size={25} className="mx-auto text-gray-300" />
                  <p className="mt-3 text-sm font-medium text-gray-500">
                    No elections found
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Elections will appear here once they are available.
                  </p>
                </div>
              )}
            </div>
          </aside>
          <main className="min-w-0">{renderSelectedElection()}</main>
        </div>
      </div>
    </div>
  );
}