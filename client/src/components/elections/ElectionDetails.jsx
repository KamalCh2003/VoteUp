// src/components/elections/ElectionDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Users, Vote, ArrowLeft, Loader2, Share2, CheckCircle,
  TrendingUp, X, Wallet, CreditCard, Smartphone, Minus, Plus
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ElectionDetails() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteBalance, setVoteBalance] = useState(0);
  const [votingCandidateId, setVotingCandidateId] = useState(null);
  const [copiedCandidateId, setCopiedCandidateId] = useState(null);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [electionRes, voteCheckRes, userRes] = await Promise.all([
          api.get(`/elections/${id}`),
          user ? api.get(`/votes/check/${id}`) : Promise.resolve({ data: { hasVoted: false } }),
          user ? api.get('/users/me') : Promise.resolve({ data: { user: { voteCredits: 0 } } })
        ]);
        setElection(electionRes.data.election);
        setHasVoted(voteCheckRes.data.hasVoted);
        setVoteBalance(userRes.data.user?.voteCredits || 0);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load election details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, toast]);

  const openPaymentModal = (candidate) => {
    setSelectedCandidate(candidate);
    setQuantity(1);
    setPaymentMethod('');
    setShowPaymentModal(true);
  };

  const handleDirectVote = async (candidateId) => {
    if (!user) {
      toast.error('Please login to vote');
      navigate('/login');
      return;
    }
    if (user.role !== 'VOTER') {
      toast.error('Only voters can cast votes');
      return;
    }
    if (hasVoted) {
      toast.error('You have already voted in this election');
      return;
    }
    if (voteBalance <= 0) {
      openPaymentModal(election.candidates.find(c => c.id === candidateId));
      return;
    }

    setVotingCandidateId(candidateId);
    try {
      await api.post('/votes', { electionId: id, candidateId, useCredit: true });
      toast.success('Vote cast! One credit used.');
      const [electionRes, userRes] = await Promise.all([
        api.get(`/elections/${id}`),
        api.get('/users/me')
      ]);
      setElection(electionRes.data.election);
      setHasVoted(true);
      setVoteBalance(userRes.data.user?.voteCredits || 0);
      if (refreshUser) await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Vote failed');
    } finally {
      setVotingCandidateId(null);
    }
  };

  const handlePaymentAndVote = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    setProcessingPayment(true);
    try {
      // Simulate payment – replace with real backend call
      // await api.post('/payments/vote-credits', { quantity, electionId: id, method: paymentMethod });
      await new Promise(resolve => setTimeout(resolve, 1500));
      // After payment, add credits and vote
      await api.post('/votes', { electionId: id, candidateId: selectedCandidate.id, useCredit: true });
      toast.success(`Purchased ${quantity} vote(s) and cast your vote!`);
      // Refresh everything
      const [electionRes, userRes] = await Promise.all([
        api.get(`/elections/${id}`),
        api.get('/users/me')
      ]);
      setElection(electionRes.data.election);
      setHasVoted(true);
      setVoteBalance(userRes.data.user?.voteCredits || 0);
      if (refreshUser) await refreshUser();
      setShowPaymentModal(false);
      setSelectedCandidate(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment or vote failed');
    } finally {
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-400" size={48} />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Election not found</h2>
          <Link to="/elections" className="text-violet-400 hover:underline">Back to Elections</Link>
        </div>
      </div>
    );
  }

  const isActive = election.status === 'ACTIVE' && new Date() <= new Date(election.endDate);
  const canVote = isActive && !hasVoted && user?.role === 'VOTER';
  const pricePerVote = election.votePrice || 100;
  const totalAmount = quantity * pricePerVote;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0B1020] to-black">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <Link to="/elections" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
          <ArrowLeft size={18} /> Back to Elections
        </Link>

        {/* Election Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{election.title}</h1>
          <p className="text-gray-400 text-lg">{election.description}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar size={16} /> {new Date(election.startDate).toLocaleDateString()} – {new Date(election.endDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} /> {election.candidates?.length || 0} Candidates
            </div>
            <div className="flex items-center gap-2">
              <Vote size={16} /> {election.totalVotes?.toLocaleString() || 0} Votes Cast
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border
              ${election.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                election.status === 'UPCOMING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
              {election.status === 'ACTIVE' && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
              {election.status}
            </span>
            {user && user.role === 'VOTER' && (
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 text-sm">
                <TrendingUp size={14} className="text-violet-400" />
                <span>Vote credits: <strong>{voteBalance}</strong></span>
                <button
                  onClick={() => navigate('/voter/buy-votes')}
                  className="ml-1 text-violet-400 hover:underline text-xs"
                >
                  Buy more
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Candidates Grid */}
        <h2 className="text-2xl font-bold text-white mb-6">Candidates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {election.candidates?.map((candidate) => {
            const isCopied = copiedCandidateId === candidate.id;
            return (
              <div
                key={candidate.id}
                className="group relative flex flex-col items-center text-center rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.05] hover:-translate-y-1"
              >
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                  {candidate.user?.firstName?.[0]}{candidate.user?.lastName?.[0]}
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition">
                  {candidate.user?.firstName} {candidate.user?.lastName}
                </h3>
                <p className="text-gray-400 text-sm mt-1">{candidate.party || 'Independent'}</p>
                {candidate.slogan && (
                  <p className="text-gray-500 text-xs mt-2 italic line-clamp-2">"{candidate.slogan}"</p>
                )}

                <div className="mt-6 flex gap-3 w-full justify-center">
                  {isActive ? (
                    <>
                      <button
                        onClick={() => handleDirectVote(candidate.id)}
                        disabled={(!canVote && voteBalance > 0) || votingCandidateId === candidate.id}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition ${
                          canVote && votingCandidateId !== candidate.id && voteBalance > 0
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25'
                            : (canVote && voteBalance === 0)
                              ? 'bg-amber-600/70 hover:bg-amber-700 text-white'
                              : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {votingCandidateId === candidate.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Vote size={16} />
                        )}
                        {votingCandidateId === candidate.id
                          ? 'Voting...'
                          : hasVoted
                          ? 'Voted'
                          : voteBalance === 0
                          ? 'Buy & Vote'
                          : 'Vote'}
                      </button>
                      {canVote && voteBalance === 0 && (
                        <span className="text-xs text-amber-400 self-center">(0 credits)</span>
                      )}
                    </>
                  ) : election.status === 'ENDED' && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{candidate.votesReceived?.toLocaleString() || 0}</div>
                      <div className="text-xs text-gray-400">Votes</div>
                    </div>
                  )}

                  <button
                    onClick={() => handleShare(candidate)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-gray-300 hover:text-white"
                    title="Share candidate profile"
                  >
                    {isCopied ? <CheckCircle size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                    <span className="text-sm">{isCopied ? 'Copied!' : 'Share'}</span>
                  </button>
                </div>

                {isActive && (
                  <div className="mt-6 w-full">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Votes</span>
                      <span>{candidate.votesReceived?.toLocaleString() || 0}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                        style={{ width: `${((candidate.votesReceived || 0) / (election.totalVotes || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {(!election.candidates || election.candidates.length === 0) && (
            <div className="col-span-full text-center py-12 text-gray-500">No candidates yet.</div>
          )}
        </div>
      </div>

      {/* Payment Modal (Buy & Vote) */}
      {showPaymentModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#0B1020] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3">
                  {selectedCandidate.user?.firstName?.[0]}{selectedCandidate.user?.lastName?.[0]}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedCandidate.user?.firstName} {selectedCandidate.user?.lastName}
                </h3>
                <p className="text-gray-400 text-sm">{selectedCandidate.party || 'Independent'}</p>
                <p className="text-gray-500 text-xs mt-1">"{selectedCandidate.slogan}"</p>
              </div>

              {/* Quantity selector */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300">Price per vote</span>
                  <span className="text-white font-semibold">रू {pricePerVote}</span>
                </div>
                <div className="flex items-center justify-between bg-[#12121b] border border-white/10 rounded-xl p-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xl font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex justify-between mt-3 pt-2 border-t border-white/10">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-violet-400 font-bold">रू {totalAmount}</span>
                </div>
              </div>

              {/* Payment methods */}
              <p className="text-sm text-gray-300 mb-2">Select payment method:</p>
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => setPaymentMethod('khalti')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${
                    paymentMethod === 'khalti' ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <Wallet size={18} className="text-violet-400" />
                  <span className="flex-1 text-left text-white">Khalti</span>
                  {paymentMethod === 'khalti' && <CheckCircle size={16} className="text-emerald-400" />}
                </button>
                <button
                  onClick={() => setPaymentMethod('esewa')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${
                    paymentMethod === 'esewa' ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <CreditCard size={18} className="text-emerald-400" />
                  <span className="flex-1 text-left text-white">eSewa</span>
                  {paymentMethod === 'esewa' && <CheckCircle size={16} className="text-emerald-400" />}
                </button>
                <button
                  onClick={() => setPaymentMethod('mobile_banking')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition ${
                    paymentMethod === 'mobile_banking' ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <Smartphone size={18} className="text-cyan-400" />
                  <span className="flex-1 text-left text-white">Mobile Banking</span>
                  {paymentMethod === 'mobile_banking' && <CheckCircle size={16} className="text-emerald-400" />}
                </button>
              </div>

              <button
                onClick={handlePaymentAndVote}
                disabled={processingPayment || !paymentMethod}
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-70 transition text-white"
              >
                {processingPayment ? <Loader2 size={20} className="animate-spin mx-auto" /> : `Buy & Vote (रू ${totalAmount})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}