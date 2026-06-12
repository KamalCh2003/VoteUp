// src/components/contestant/ContestantDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  Vote,
  ArrowLeft,
  Loader2,
  Share2,
  CheckCircle,
  Trophy,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ContestantDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCandidateId, setCopiedCandidateId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getTimeRemaining = (endDate) => {
    const total = Date.parse(endDate) - Date.now();
    if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { total, days, hours, minutes, seconds };
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

  const fetchCompetitors = async (electionId) => {
    if (!electionId) return;
    try {
      const res = await api.get(`/elections/${electionId}`);
      const candidates = res.data.election.candidates || [];
      const sorted = [...candidates].sort((a, b) => b.votesReceived - a.votesReceived);
      setCompetitors(sorted);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch competitors:', err);
    }
  };

  useEffect(() => {
    const fetchMyElection = async () => {
      try {
        const { data: candidateData } = await api.get('/candidates/me');
        const myCandidate = candidateData.candidate;
        if (!myCandidate || !myCandidate.electionId) {
          setElection(null);
          setLoading(false);
          return;
        }
        const { data: electionData } = await api.get(`/elections/${myCandidate.electionId}`);
        const fetchedElection = electionData.election;
        setElection(fetchedElection);
        if (fetchedElection.status === 'ACTIVE') {
          setTimeLeft(getTimeRemaining(fetchedElection.endDate));
        }
        await fetchCompetitors(myCandidate.electionId);
        const interval = setInterval(() => {
          if (myCandidate.electionId) fetchCompetitors(myCandidate.electionId);
        }, 15000);
        return () => clearInterval(interval);
      } catch (err) {
        console.error('Failed to fetch contestant election:', err);
        toast.error('Could not load your election details');
      } finally {
        setLoading(false);
      }
    };
    fetchMyElection();
  }, [toast]);

  useEffect(() => {
    if (!election || election.status !== 'ACTIVE') return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(election.endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [election]);

  const handleShareCandidate = async (candidate) => {
    const shareUrl = `${window.location.origin}/candidate/${candidate.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${candidate.user?.firstName} ${candidate.user?.lastName}`,
          text: `Support ${candidate.user?.firstName} ${candidate.user?.lastName} in the election!`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedCandidateId(candidate.id);
      setTimeout(() => setCopiedCandidateId(null), 2000);
      toast.success('Link copied!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-violet-400" size={48} />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">You are not part of any election yet.</p>
        <Link to="/contestant/apply" className="text-violet-400 hover:underline mt-2 inline-block">
          Apply now
        </Link>
      </div>
    );
  }

  const isActive = election.status === 'ACTIVE' && new Date() <= new Date(election.endDate);
  const pricePerVote = election.votePrice || 0;
  const totalVotes = election.totalVotes || 1;
  const currentUserRank = competitors.findIndex(c => c.user?.id === user?.id) + 1;

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/contestant/profile-campaign')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={18} /> Back to Profile
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <RefreshCw size={12} className={competitors.length ? 'animate-spin' : ''} />
            <span>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Election details + candidate cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{election.title}</h1>
              <p className="text-gray-400 text-sm md:text-base">{election.description}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={14} /> {new Date(election.startDate).toLocaleDateString()} – {new Date(election.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} /> {election.candidates?.length || 0} Candidates
                </div>
                <div className="flex items-center gap-1">
                  <Vote size={14} /> {election.totalVotes?.toLocaleString() || 0} Votes
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  election.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : election.status === 'UPCOMING'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {election.status === 'ACTIVE' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  {election.status}
                </span>
                {pricePerVote === 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">Free</span>
                )}
                {isActive && timeLeft && timeLeft.total > 0 && (
                  <div className="flex items-center gap-1 text-xs text-cyan-400 bg-white/5 rounded-full px-3 py-1">
                    <Clock size={12} />
                    <span className="font-mono">{formatCountdown(timeLeft)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Candidates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {election.candidates?.map((candidate) => {
                  const share = ((candidate.votesReceived || 0) / totalVotes) * 100;
                  const isCopied = copiedCandidateId === candidate.id;
                  return (
                    <div
                      key={candidate.id}
                      className="group rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-4 transition hover:border-violet-500/30 hover:bg-white/[0.05] w-full aspect-square flex flex-col"
                    >
                      {/* Circular avatar */}
                      <div className="flex justify-center mb-2">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                          {candidate.avatarUrl ? (
                            <img src={candidate.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            `${candidate.user?.firstName?.[0]}${candidate.user?.lastName?.[0]}`
                          )}
                        </div>
                      </div>
                      <h3 className="font-semibold text-white text-center truncate">
                        {candidate.user?.firstName} {candidate.user?.lastName}
                      </h3>
                      <p className="text-gray-400 text-xs text-center truncate">
                        {candidate.party || 'Independent'}
                      </p>
                      {candidate.slogan && (
                        <p className="text-gray-500 text-xs mt-1 text-center line-clamp-2 italic">
                          "{candidate.slogan}"
                        </p>
                      )}
                      {isActive && (
                        <div className="mt-auto pt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                            <span>Vote share</span>
                            <span>{share.toFixed(1)}%</span>
                          </div>
                          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {!isActive && election.status === 'ENDED' && (
                        <div className="mt-auto text-center text-sm">
                          <span className="text-white font-medium">{share.toFixed(1)}%</span>
                          <span className="text-gray-500 text-xs"> vote share</span>
                        </div>
                      )}
                      <div className="mt-3 flex justify-center">
                        <button
                          onClick={() => handleShareCandidate(candidate)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
                        >
                          {isCopied ? <CheckCircle size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                          <span>{isCopied ? 'Copied!' : 'Share'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!election.candidates || election.candidates.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">No candidates yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Leaderboard (unchanged) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-400" /> Leaderboard
                </h2>
                {currentUserRank > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <UserCheck size={12} />
                    Your rank: <span className="text-white font-bold">#{currentUserRank}</span>
                  </div>
                )}
              </div>

              {/* Desktop ranking – no vote count, only share % */}
              <div className="hidden sm:block">
                <div className="space-y-3">
                  {competitors.map((comp, idx) => {
                    const isYou = comp.user.id === user?.id;
                    const share = ((comp.votesReceived || 0) / totalVotes) * 100;
                    return (
                      <div
                        key={comp.id}
                        className={`flex items-center justify-between p-3 rounded-xl transition ${
                          isYou ? 'bg-violet-500/10 border border-violet-500/30' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 text-center font-bold text-white">
                            {idx === 0 && <Trophy size={14} className="inline text-yellow-400 mr-1" />}
                            #{idx + 1}
                          </div>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                            {comp.avatarUrl ? (
                              <img src={comp.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              `${comp.user.firstName[0]}${comp.user.lastName[0]}`
                            )}
                          </div>
                          <div>
                            <span className={`text-sm font-medium ${isYou ? 'text-violet-400' : 'text-white'}`}>
                              {comp.user.firstName} {comp.user.lastName} {isYou && '(You)'}
                            </span>
                            <p className="text-xs text-gray-400">{comp.party || 'Independent'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">{share.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile ranking cards */}
              <div className="sm:hidden space-y-3">
                {competitors.map((comp, idx) => {
                  const isYou = comp.user.id === user?.id;
                  const share = ((comp.votesReceived || 0) / totalVotes) * 100;
                  return (
                    <div
                      key={comp.id}
                      className={`rounded-xl border border-white/10 p-3 ${isYou ? 'bg-violet-500/10 border-violet-500/30' : 'bg-white/[0.02]'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-white text-sm">#{idx + 1}</div>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                            {comp.avatarUrl ? <img src={comp.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : `${comp.user.firstName[0]}${comp.user.lastName[0]}`}
                          </div>
                          <div>
                            <span className={`text-sm font-medium ${isYou ? 'text-violet-400' : 'text-white'}`}>
                              {comp.user.firstName} {comp.user.lastName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">{share.toFixed(1)}%</div>
                        </div>
                      </div>
                      {isYou && <p className="text-xs text-violet-400 mt-1">You</p>}
                    </div>
                  );
                })}
              </div>

              {competitors.length === 0 && (
                <div className="text-center py-8 text-gray-500">No contestants yet.</div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Campaign Snapshot</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{election.totalVotes?.toLocaleString() || 0}</p>
                  <p className="text-xs text-gray-400">Total Votes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{election.candidates?.length || 0}</p>
                  <p className="text-xs text-gray-400">Contestants</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}