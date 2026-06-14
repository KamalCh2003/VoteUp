import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying payment...');
  const processed = useRef(false); // prevent duplicate execution

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const verifyAndVote = async () => {
      const pidx = searchParams.get('pidx');
      const transactionId = searchParams.get('transaction_id');
      const statusParam = searchParams.get('status');

      if (!pidx || statusParam !== 'Completed') {
        setStatus('error');
        setMessage('Payment failed or cancelled.');
        toast.error('Payment was not successful');
        sessionStorage.removeItem('pendingVote');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // 1. Verify payment with backend
        const verifyRes = await api.post('/payments/khalti/verify', {
          pidx,
          transaction_id: transactionId,
          status: statusParam,
        });
        const paymentId = verifyRes.data.paymentId;

        // 2. Get pending vote data
        const pendingData = sessionStorage.getItem('pendingVote');
        if (!pendingData) throw new Error('No pending vote data');
        const { electionId, candidateId, quantity } = JSON.parse(pendingData);

        // 3. Cast the vote (may fail if already voted)
        try {
          await api.post('/votes', {
            electionId,
            candidateId,
            quantity,
            paymentId,
          });
          setStatus('success');
          setMessage(`${quantity} vote(s) cast successfully!`);
          toast.success('Vote recorded!');
          sessionStorage.removeItem('pendingVote');
          setTimeout(() => navigate(`/elections/${electionId}`), 2000);
        } catch (voteErr) {
          // If the error is "already voted", treat it as success
          const errorMsg = voteErr.response?.data?.error || '';
          if (errorMsg.toLowerCase().includes('already voted')) {
            setStatus('success');
            setMessage('You have already voted in this election.');
            toast.info('Vote already counted');
            sessionStorage.removeItem('pendingVote');
            setTimeout(() => navigate(`/elections/${electionId}`), 2000);
          } else {
            throw voteErr;
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
        setMessage(err.response?.data?.error || 'Payment verification failed');
        toast.error('Failed to record vote');
        sessionStorage.removeItem('pendingVote');
        setTimeout(() => navigate('/'), 4000);
      }
    };

    verifyAndVote();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white border border-white rounded-2xl p-8 text-center max-w-md w-full">
        {status === 'processing' && (
          <>
            <Loader2 className="animate-spin text-violet-400 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-black mb-2">Processing Payment</h2>
            <p className="text-gray-400">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="text-emerald-400 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-black mb-2">Payment Successful</h2>
            <p className="text-gray-400">{message}</p>
            <p className="text-xs text-gray-500 mt-4">Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="text-red-400 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-black mb-2">Payment Failed</h2>
            <p className="text-gray-400">{message}</p>
            <p className="text-xs text-gray-500 mt-4">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}