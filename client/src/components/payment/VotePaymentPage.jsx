// src/components/payment/VotePaymentPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Minus, Plus, Shield, ArrowLeft } from 'lucide-react';
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

  // Fetch election details (to get vote price)
  useEffect(() => {
    if (!electionId || !candidateId) {
      toast.error('Missing election or candidate information');
      navigate(-1);
      return;
    }

    const fetchElection = async () => {
      try {
        const { data } = await api.get(`/elections/${electionId}`);
        setElection(data.election);
        // Optionally fetch candidate info if needed
        // const candRes = await api.get(`/candidates/${candidateId}`);
        // setCandidate(candRes.data.candidate);
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

  const increment = () => setQuantity(prev => Math.min(prev + 1, 100));
  const decrement = () => setQuantity(prev => Math.max(prev - 1, 1));

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
      // 1. Initiate Khalti payment
      const { data } = await api.post('/payments/khalti/initiate', {
        electionId,
        candidateId,
        quantity,
      });

      // 2. Save pending vote data to sessionStorage
      sessionStorage.setItem('pendingVote', JSON.stringify({
        electionId,
        candidateId,
        quantity,
        returnUrl: `/elections/${electionId}`,
      }));

      // 3. Redirect to Khalti payment page
      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Purchase Vote Credits</h1>
          <p className="text-gray-500">
            Voting in <strong>{election.title}</strong> – each vote costs रू {pricePerVote}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Quantity Selector & Summary */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Number of Votes</h2>

            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <button onClick={decrement} className="h-10 w-10 rounded-lg bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center border">
                <Minus size={18} />
              </button>
              <span className="text-3xl font-bold text-gray-900">{quantity}</span>
              <button onClick={increment} className="h-10 w-10 rounded-lg bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center border">
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between py-2 border-b">
                <span>Price per vote</span>
                <span className="font-mono">रू {pricePerVote}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Quantity</span>
                <span className="font-mono">{quantity}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-violet-600">रू {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Method & Pay Button */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Method</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-violet-200 bg-violet-50">
                <Shield size={24} className="text-violet-600" />
                <div>
                  <p className="font-medium text-gray-800">Khalti</p>
                  <p className="text-xs text-gray-500">Pay securely via Khalti wallet or mobile banking</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">Other payment methods (eSewa, mobile banking) coming soon.</p>
            </div>

            <button
              onClick={handleKhaltiPayment}
              disabled={processing}
              className="w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-md disabled:opacity-70"
            >
              {processing ? <Loader2 size={20} className="animate-spin" /> : null}
              Pay रू {totalAmount.toLocaleString()} via Khalti
            </button>

            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 justify-center">
              <Shield size={14} />
              <span>Secure payment. Vote credits are added immediately after confirmation.</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Each vote credit allows you to cast one vote in any active election.</p>
          <p>You may vote only once per election, but you can buy as many credits as you like.</p>
        </div>
      </div>
    </div>
  );
}