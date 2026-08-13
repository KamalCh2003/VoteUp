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
  Shield,
  BarChart3,
  Settings,
  Flag,
  FileText,
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
  const [activeTab, setActiveTab] = useState('overview');

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
  const isFree = pricePerVote === 0;
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
      if (isFree) {
        setHasVoted(true);
      }
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
    if (isFree) {
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'rules', label: 'Rules', icon: Shield },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'faq', label: 'FAQ', icon: FileText },
  ];

  // Shared candidate card renderer – rectangular image (80%) + text/buttons (20%)
  const renderCandidateCards = () => {
    if (!election.candidates || election.candidates.length === 0) {
      return <p className="text-gray-500 text-center py-8 col-span-full">No candidates yet.</p>;
    }

    return election.candidates.map((candidate) => {
      const isCopied = copiedCandidateId === candidate.id;
      let buttonDisabled = false;
      let buttonText = 'Vote';
      if (!isActive) {
        buttonDisabled = true;
        buttonText = election.status === 'ENDED' ? 'Ended' : 'Not Active';
      } else if (user && user.role !== 'VOTER') {
        buttonDisabled = true;
        buttonText = 'Not allowed';
      } else if (isFree && hasVoted) {
        buttonDisabled = true;
        buttonText = 'Voted';
      }

      return (
        <div
          key={candidate.id}
          className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Image section – 80% of card height (aspect ratio ~4:3) */}
          <div className="relative w-full pt-[75%] bg-gradient-to-br from-violet-500 to-indigo-500">
            {candidate.avatarUrl ? (
              <img
                src={candidate.avatarUrl}
                alt={`${candidate.user?.firstName} ${candidate.user?.lastName}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
                {candidate.user?.firstName?.[0]}{candidate.user?.lastName?.[0]}
              </div>
            )}
          </div>

          {/* Text + buttons section – 20% of card */}
          <div className="p-3 flex flex-col items-center justify-between flex-1">
            <div className="text-center">
              <p className="font-semibold text-gray-900 text-sm truncate w-full">
                {candidate.user?.firstName} {candidate.user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{candidate.party || 'Independent'}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => handleVote(candidate.id)}
                disabled={buttonDisabled || votingCandidateId === candidate.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  !buttonDisabled && !(votingCandidateId === candidate.id)
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {votingCandidateId === candidate.id ? '...' : buttonText}
              </button>
              <button
                onClick={() => handleShare(candidate)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                title="Share candidate profile"
              >
                {isCopied ? (
                  <CheckCircle size={16} className="text-emerald-500" />
                ) : (
                  <Share2 size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      );
    });
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <Link to="/elections" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition">
          <ArrowLeft size={18} /> Back to Elections
        </Link>

        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-48 bg-gradient-to-r from-violet-600 to-blue-600">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
            <span className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/80 text-white text-xs font-semibold mb-2">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              {election.status}
            </span>
            <h1 className="text-3xl font-bold">{election.title}</h1>
            <p className="text-sm opacity-90">Organized by {election.organizerName || 'VoteUp'}</p>
          </div>
        </div>

        {/* Main Content: Desktop Tabs + Sidebar, Mobile simplified */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main area (left column on desktop) */}
          <div className="lg:col-span-2">
            {/* --- MOBILE VIEW (hidden on desktop) --- */}
            <div className="block lg:hidden space-y-6">
              {/* Election description */}
              <div className="hidden bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About this election</h3>
                <p className="text-gray-700 leading-relaxed">
                  {election.description || 'No description provided.'}
                </p>
              </div>

              {/* Candidate cards – mobile */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Candidates ({election.candidates?.length || 0})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {renderCandidateCards()}
                </div>
              </div>
            </div>

            {/* --- DESKTOP VIEW (hidden on mobile) --- */}
            <div className="hidden lg:block">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                        activeTab === tab.id
                          ? 'border-violet-600 text-violet-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon size={16} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About this election</h3>
                    <p className="text-gray-700 leading-relaxed">{election.description || 'No description provided.'}</p>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Start Date</span><br /><span className="font-medium">{new Date(election.startDate).toLocaleString()}</span></div>
                      <div><span className="text-gray-500">End Date</span><br /><span className="font-medium">{new Date(election.endDate).toLocaleString()}</span></div>
                      <div><span className="text-gray-500">Category</span><br /><span className="font-medium">{election.category}</span></div>
                      <div><span className="text-gray-500">Candidates</span><br /><span className="font-medium">{election.candidates?.length || 0}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Vote Price</span><br /><span className="font-medium">{election.votePrice === 0 ? 'Free' : `रू ${election.votePrice}`}</span></div>
                    </div>
                  </div>
                )}

                {activeTab === 'candidates' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidates ({election.candidates?.length || 0})</h3>
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                      {renderCandidateCards()}
                    </div>
                  </div>
                )}

                {activeTab === 'rules' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rules & Eligibility</h3>
                    {election.rules ? (
                      <div className="whitespace-pre-wrap text-gray-700">{election.rules}</div>
                    ) : (
                      <p className="text-gray-500">No specific rules provided.</p>
                    )}
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                    <div className="relative border-l-2 border-gray-200 pl-6 space-y-6">
                      <div className="relative">
                        <div className="absolute -left-2.5 top-1.5 h-3 w-3 rounded-full bg-violet-600" />
                        <p className="font-medium text-gray-800">Registration opened</p>
                        <p className="text-sm text-gray-500">{new Date(election.startDate).toLocaleString()}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-2.5 top-1.5 h-3 w-3 rounded-full bg-violet-600" />
                        <p className="font-medium text-gray-800">Voting begins</p>
                        <p className="text-sm text-gray-500">{new Date(election.startDate).toLocaleString()}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-2.5 top-1.5 h-3 w-3 rounded-full bg-violet-600" />
                        <p className="font-medium text-gray-800">Voting ends</p>
                        <p className="text-sm text-gray-500">{new Date(election.endDate).toLocaleString()}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-2.5 top-1.5 h-3 w-3 rounded-full bg-violet-600" />
                        <p className="font-medium text-gray-800">Results announced</p>
                        <p className="text-sm text-gray-500">Within 24 hours of close</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      <div><p className="font-medium text-gray-800">Can I change my vote after submitting?</p><p className="text-sm text-gray-600">No – once your vote is confirmed with OTP, it is final and cannot be changed.</p></div>
                      <div><p className="font-medium text-gray-800">Who can vote in this election?</p><p className="text-sm text-gray-600">Any verified voter meeting this election's eligibility criteria.</p></div>
                      <div><p className="font-medium text-gray-800">When will results be published?</p><p className="text-sm text-gray-600">Live results are visible throughout voting, with certified final results within 24 hours of close.</p></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar – hidden on mobile */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Election Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Voting ends</span><span className="font-medium">{new Date(election.endDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Candidates</span><span className="font-medium">{election.candidates?.length || 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Price per vote</span><span className="font-medium">{election.votePrice === 0 ? 'Free' : `रू ${election.votePrice}`}</span></div>
              </div>
              {isActive && user?.role === 'VOTER' && (
                (isFree && !hasVoted) || (!isFree) ? (
                  <button
                    onClick={() => setActiveTab('candidates')}
                    className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition"
                  >
                    <Vote size={16} className="inline mr-2" /> Vote Now
                  </button>
                ) : null
              )}
              {isFree && hasVoted && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle size={16} /> You have already voted in this free election
                </div>
              )}
              {!isFree && hasVoted && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm flex items-center gap-2">
                  <CheckCircle size={16} /> You have voted in this paid election (you can vote again)
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Organizer</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {election.organizerName?.[0] || 'V'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{election.organizerName || 'VoteUp'}</p>
                  <p className="text-xs text-gray-500">{election.category}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <button className="w-full py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm font-medium">
                <Share2 size={16} /> Share Election
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
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
                  {selectedCandidate.avatarUrl ? <img src={selectedCandidate.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : `${selectedCandidate.user?.firstName?.[0]}${selectedCandidate.user?.lastName?.[0]}`}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{selectedCandidate.user?.firstName} {selectedCandidate.user?.lastName}</h3>
                <p className="text-gray-500 text-sm">{selectedCandidate.party || "Independent"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-3"><span className="text-gray-600">Price per vote</span><span className="font-semibold">रू {pricePerVote}</span></div>
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"><Minus size={16} /></button>
                  <span className="text-xl font-bold text-gray-800">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"><Plus size={16} /></button>
                </div>
                <div className="flex justify-between mt-3 pt-2 border-t border-gray-200"><span className="text-gray-600 font-medium">Total</span><span className="text-violet-600 font-bold">रू {totalAmount}</span></div>
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

      {/* Confirmation Modal */}
      {showConfirmModal && confirmCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
            <button onClick={() => setShowConfirmModal(false)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"><X size={20} /></button>
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Confirm Your Vote</h3>
                <p className="text-gray-600 text-sm mt-2">You are about to vote for:</p>
                <div className="mt-3 flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center overflow-hidden mb-2">
                    {confirmCandidate.avatarUrl ? <img src={confirmCandidate.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-white text-2xl font-bold">{confirmCandidate.user?.firstName?.[0]}{confirmCandidate.user?.lastName?.[0]}</span>}
                  </div>
                  <p className="text-gray-800 font-semibold text-lg">{confirmCandidate.user?.firstName} {confirmCandidate.user?.lastName}</p>
                  <p className="text-gray-500 text-sm">{confirmCandidate.party || "Independent"}</p>
                </div>
                <p className="text-amber-600 text-xs mt-4">This action cannot be undone</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={confirmVote} className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition text-white font-medium">Confirm Vote</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}