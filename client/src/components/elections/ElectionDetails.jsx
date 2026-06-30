// src/components/elections/ElectionDetails.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Vote,
  ArrowLeft,
  Loader2,
  Share2,
  CheckCircle,
  X,
  Wallet,
  Minus,
  Plus,
  Clock,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function ElectionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingCandidateId, setVotingCandidateId] = useState(null);
  const [copiedCandidateId, setCopiedCandidateId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmCandidateId, setConfirmCandidateId] = useState(null);
  const [confirmCandidate, setConfirmCandidate] = useState(null);

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
    if (time.total <= 0) return "Ended";
    const parts = [];
    if (time.days > 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);
    parts.push(`${time.seconds}s`);
    return parts.join(" ");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [electionRes, voteCheckRes] = await Promise.all([
          api.get(`/elections/${id}`),
          user ? api.get(`/votes/check/${id}`) : Promise.resolve({ data: { hasVoted: false } }),
        ]);
        const electionData = electionRes.data.election;
        setElection(electionData);
        setHasVoted(voteCheckRes.data.hasVoted);
        if (electionData.status === "ACTIVE") {
          setTimeLeft(getTimeRemaining(electionData.endDate));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load election details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, toast]);

  useEffect(() => {
    if (!election || election.status !== "ACTIVE") return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(election.endDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [election]);

  const isActive = election?.status === "ACTIVE" && new Date() <= new Date(election?.endDate);
  const pricePerVote = election?.votePrice || 0;
  const totalAmount = quantity * pricePerVote;

  const openConfirmModal = (candidateId) => {
    const candidate = election.candidates.find((c) => c.id === candidateId);
    setConfirmCandidate(candidate);
    setConfirmCandidateId(candidateId);
    setShowConfirmModal(true);
  };

  const confirmVote = async () => {
    if (!confirmCandidateId) return;
    setShowConfirmModal(false);
    setVotingCandidateId(confirmCandidateId);
    try {
      await api.post("/votes", { electionId: id, candidateId: confirmCandidateId, quantity: 1 });
      toast.success("Vote cast successfully!");
      const electionRes = await api.get(`/elections/${id}`);
      setElection(electionRes.data.election);
      setHasVoted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Vote failed");
    } finally {
      setVotingCandidateId(null);
      setConfirmCandidateId(null);
      setConfirmCandidate(null);
    }
  };

  const handleVote = async (candidateId) => {
    if (!user) {
      toast.error("Please login to vote");
      const returnUrl = window.location.pathname + window.location.search;
      navigate(`/login?from=${encodeURIComponent(returnUrl)}`);
      return;
    }
    if (user.role !== "VOTER") {
      toast.error("Only voters can cast votes");
      return;
    }
    const candidate = election.candidates.find((c) => c.id === candidateId);
    if (pricePerVote === 0) {
      if (hasVoted) {
        toast.error("You have already voted in this free election");
        return;
      }
      openConfirmModal(candidateId);
    } else {
      setSelectedCandidate(candidate);
      setQuantity(1);
      setShowPaymentModal(true);
    }
  };

  const handlePayWithKhalti = async () => {
    setProcessingPayment(true);
    try {
      const res = await api.post('/payments/khalti/initiate', {
        electionId: id,
        candidateId: selectedCandidate.id,
        quantity,
      });
      sessionStorage.setItem('pendingVote', JSON.stringify({
        electionId: id,
        candidateId: selectedCandidate.id,
        quantity,
        paymentId: res.data.paymentId,
      }));
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      toast.error('Failed to initiate payment');
      setProcessingPayment(false);
    }
  };

  const handleShare = async (candidate) => {
    const shareUrl = `${window.location.origin}/candidate/${candidate.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${candidate.user?.firstName} ${candidate.user?.lastName}`,
          text: `Vote for ${candidate.user?.firstName} ${candidate.user?.lastName} in the election!`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedCandidateId(candidate.id);
      setTimeout(() => setCopiedCandidateId(null), 2000);
      toast.success("Link copied!");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={48} />
      </div>
    );
  if (!election)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Election not found</h2>
          <Link to="/elections" className="text-violet-600 hover:underline">Back to Elections</Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <Link to="/elections" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition">
          <ArrowLeft size={18} /> Back to Elections
        </Link>

        {/* Election Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">{election.title}</h1>
          <p className="text-gray-600 text-lg hidden ">{election.description}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar size={16} /> {new Date(election.startDate).toLocaleDateString()} – {new Date(election.endDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} /> {election.candidates?.length || 0} Candidates
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${
              election.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : election.status === "UPCOMING"
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-gray-100 text-gray-700 border-gray-200"
            }`}>
              {election.status === "ACTIVE" && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
              {election.status}
            </span>
            {pricePerVote === 0 && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                Free Election
              </span>
            )}
            {isActive && timeLeft && timeLeft.total > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-cyan-600  rounded-full px-3 py-1 border border-gray-200">
                <Clock size={14} />
                <span className="font-mono">{formatCountdown(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Candidates Grid – gray cards */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Candidates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {election.candidates?.map((candidate) => {
            const isCopied = copiedCandidateId === candidate.id;
            let voteButtonText = "Vote";
            let voteDisabled = false;
            let voteOnClick = () => handleVote(candidate.id);

            if (!isActive) {
              voteButtonText = election.status === "ENDED" ? "Ended" : "Not Active";
              voteDisabled = true;
            } else if (user && user.role !== "VOTER") {
              voteButtonText = "Voting not available";
              voteDisabled = true;
            } else if (pricePerVote === 0 && hasVoted) {
              voteButtonText = "Voted";
              voteDisabled = true;
            }

            return (
              <div
                key={candidate.id}
                className="group relative flex flex-col items-center text-center rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-md hover:border-violet-300 hover:-translate-y-1"
              >
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4 overflow-hidden">
                  {candidate.avatarUrl ? (
                    <img src={candidate.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    `${candidate.user?.firstName?.[0]}${candidate.user?.lastName?.[0]}`
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-violet-600 transition">
                  {candidate.user?.firstName} {candidate.user?.lastName}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{candidate.party || "Independent"}</p>
                {candidate.slogan && (
                  <p className="text-gray-500 text-xs mt-2 italic line-clamp-2">"{candidate.slogan}"</p>
                )}
                <div className="mt-6 flex gap-3 w-full justify-center">
                  {isActive ? (
                    <button
                      onClick={voteOnClick}
                      disabled={voteDisabled || votingCandidateId === candidate.id}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition ${
                        !voteDisabled && !(votingCandidateId === candidate.id)
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {votingCandidateId === candidate.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Vote size={16} />
                      )}
                      {votingCandidateId === candidate.id ? "Processing..." : voteButtonText}
                    </button>
                  ) : election.status === "ENDED" ? (
                    <div className="text-center text-gray-500 text-sm">Election ended</div>
                  ) : null}
                  <button
                    onClick={() => handleShare(candidate)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition text-gray-600 hover:text-gray-800"
                    title="Share candidate profile"
                  >
                    {isCopied ? <CheckCircle size={16} className="text-emerald-500" /> : <Share2 size={16} />}
                    <span className="text-sm">{isCopied ? "Copied!" : "Share"}</span>
                  </button>
                </div>
              </div>
            );
          })}
          {(!election.candidates || election.candidates.length === 0) && (
            <div className="col-span-full text-center py-12 text-gray-500">No candidates yet.</div>
          )}
        </div>
      </div>

      {/* Payment Modal (unchanged – already light theme) */}
      {showPaymentModal && selectedCandidate && pricePerVote > 0 && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-3 overflow-hidden">
                  {selectedCandidate.avatarUrl ? (
                    <img src={selectedCandidate.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    `${selectedCandidate.user?.firstName?.[0]}${selectedCandidate.user?.lastName?.[0]}`
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedCandidate.user?.firstName} {selectedCandidate.user?.lastName}
                </h3>
                <p className="text-gray-500 text-sm">{selectedCandidate.party || "Independent"}</p>
                <p className="text-gray-500 text-xs mt-1">"{selectedCandidate.slogan}"</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Price per vote</span>
                  <span className="text-gray-800 font-semibold">रू {pricePerVote}</span>
                </div>
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"><Minus size={16} /></button>
                  <span className="text-xl font-bold text-gray-800">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"><Plus size={16} /></button>
                </div>
                <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-violet-600 font-bold">रू {totalAmount}</span>
                </div>
              </div>
              <button
                onClick={handlePayWithKhalti}
                disabled={processingPayment}
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition text-white flex items-center justify-center gap-2"
              >
                {processingPayment ? <Loader2 size={20} className="animate-spin" /> : <Wallet size={20} />}
                {processingPayment ? "Processing..." : `Pay with Khalti (रू ${totalAmount})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (unchanged) */}
      {showConfirmModal && confirmCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Confirm Your Vote</h3>
                <p className="text-gray-600 text-sm mt-2">You are about to vote for:</p>
                <div className="mt-3 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden mb-2">
                    {confirmCandidate.avatarUrl ? (
                      <img src={confirmCandidate.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {confirmCandidate.user?.firstName?.[0]}{confirmCandidate.user?.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 font-semibold text-lg">
                    {confirmCandidate.user?.firstName} {confirmCandidate.user?.lastName}
                  </p>
                  <p className="text-gray-500 text-sm">{confirmCandidate.party || "Independent"}</p>
                </div>
                <p className="text-amber-600 text-xs mt-4">This action cannot be undone</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmVote}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition text-white font-medium"
                >
                  Confirm Vote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}