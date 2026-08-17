// src/components/payment/VotePaymentPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Minus, Plus, Shield, ArrowLeft, Wallet, QrCode, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function VotePaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const electionId = searchParams.get('electionId');
  const candidateId = searchParams.get('candidateId');

  const [election, setElection] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loadingElection, setLoadingElection] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);

  // Helper to detect mobile device
  const isMobile = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  useEffect(() => {
    if (!electionId || !candidateId) {
      toast.error('Missing election or candidate information');
      navigate(-1);
      return;
    }

    const fetchElection = async () => {
      try {
        const { data } = await api.get(`/elections/${electionId}`);
        const electionData = data.election;
        setElection(electionData);
        const foundCandidate = electionData.candidates?.find(c => c.id === candidateId);
        setCandidate(foundCandidate || null);
      } catch (err) {
        toast.error('Failed to load election details');
        navigate(-1);
      } finally {
        setLoadingElection(false);
      }
    };
    fetchElection();
  }, [electionId, candidateId, navigate, toast]);

  const pricePerVote = election?.votePrice || 100;
  const totalAmount = quantity * pricePerVote;

  const increment = () => {
    setQuantity(prev => Math.min(prev + 1, 100));
  };

  const decrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity('');
      return;
    }
    const num = Number(value);
    if (!isNaN(num) && Number.isInteger(num) && num >= 1 && num <= 100) {
      setQuantity(num);
    }
  };

  const handleQuantityBlur = () => {
    const num = Number(quantity);
    if (isNaN(num) || num < 1) {
      setQuantity(1);
    } else if (num > 100) {
      setQuantity(100);
    } else {
      setQuantity(num);
    }
  };

  const handleKhaltiPayment = async () => {
    if (!electionId || !candidateId) {
      toast.error('Missing election or candidate information');
      return;
    }
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setProcessing(true);
    try {
      const { data } = await api.post('/payments/khalti/initiate', {
        electionId,
        candidateId,
        quantity,
      });

      sessionStorage.setItem('pendingVote', JSON.stringify({
        electionId,
        candidateId,
        quantity,
        returnUrl: `/elections/${electionId}`,
      }));

      let paymentUrl = data.paymentUrl;

      // If we are on desktop and the URL is a deep link, convert to web URL
      if (!isMobile() && paymentUrl.startsWith('khaltipay://')) {
        // Extract pidx from deep link: khaltipay://go/?t=kpg&pidx=abc123
        const urlParams = new URLSearchParams(paymentUrl.split('?')[1]);
        const pidx = urlParams.get('pidx');
        if (pidx) {
          // Khalti web payment URL format
          paymentUrl = `https://payment.khalti.com/epayment/?pidx=${pidx}`;
        } else {
          // Fallback: use the returned URL as-is (will likely fail, but better than nothing)
          console.warn('Could not extract pidx from deep link, using original URL');
        }
      }

      window.location.href = paymentUrl;
    } catch (err) {
      console.error('Payment initiation error:', err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Failed to initiate payment';
      toast.error(errorMsg);
      setProcessing(false);
    }
  };

  if (loadingElection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Election not found</h2>
          <button onClick={() => navigate(-1)} className="text-violet-600 hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  const candidateInitials = candidate?.user
    ? `${candidate.user.firstName?.[0] || ''}${candidate.user.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-left mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Voting Summary</h1>
          <p className="text-gray-500 text-sm mt-1">Confirm your vote details before proceeding.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/*Candidate Card*/}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="relative w-full pt-[90%] bg-gradient-to-br from-violet-500 to-indigo-500">
              {candidate?.avatarUrl ? (
                <img
                  src={candidate.avatarUrl}
                  alt={`${candidate.user?.firstName} ${candidate.user?.lastName}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold">
                  {candidateInitials}
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col items-center justify-center text-center">
              <p className="font-semibold text-gray-900 text-lg truncate w-full">
                {candidate?.user?.firstName} {candidate?.user?.lastName}
              </p>
              <p className="text-lg text-gray-400 mt-0.5">Candidate #: <span className="font-mono font-medium text-gray-700">{candidate?.candidateNumber || '—'}</span></p>
              {candidate?.slogan && (
                <p className="text-sm text-gray-400 italic mt-0.5">“{candidate.slogan}”</p>
              )}
            </div>
          </div>

          {/* Right: Payment Panel */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Wallet size={20} className="text-violet-600" />
              Payment Summary
            </h2>

            {/* Quantity Selector with editable input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Votes</label>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3">
                <button
                  onClick={decrement}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-lg bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center border transition disabled:opacity-40"
                >
                  <Minus size={18} />
                </button>

                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={handleQuantityChange}
                  onBlur={handleQuantityBlur}
                  className="w-16 text-center text-3xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button
                  onClick={increment}
                  disabled={quantity >= 100}
                  className="h-10 w-10 rounded-lg bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center border transition disabled:opacity-40"
                >
                  <Plus size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Max 100 votes per transaction</p>
            </div>

            {/* Summary */}
            <div className="space-y-2 text-sm bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Price per vote</span>
                <span className="font-mono font-medium">रू {pricePerVote}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity</span>
                <span className="font-mono font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                <span className="text-gray-800">Total</span>
                <span className="text-violet-600">रू {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Disclaimer / Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <MessageCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Important</p>
                  <p className="text-xs text-amber-700">
                    Send the payment screenshot on <strong>WhatsApp: 9845522505</strong> and in remarks type the candidate number: <strong>{candidate?.candidateNumber || '—'}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-3 mb-4">
              <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode size={40} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Scan to pay (placeholder)</p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleKhaltiPayment}
              disabled={processing}
              className="w-full py-3.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-md disabled:opacity-70"
            >
              {processing ? <Loader2 size={20} className="animate-spin" /> : <Wallet size={20} />}
              {processing ? 'Processing...' : `Pay with Khalti (रू ${totalAmount.toLocaleString()})`}
            </button>

            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 justify-center">
              <Shield size={14} />
              <span>Do not close this page until the process is complete.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}