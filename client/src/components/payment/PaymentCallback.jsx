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
  const processed = useRef(false);

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

      // 1. Retrieve pending vote data
      const pendingData = sessionStorage.getItem('pendingVote');
      if (!pendingData) {
        setStatus('error');
        setMessage('Missing vote information. Please start over.');
        toast.error('No vote data found');
        sessionStorage.removeItem('pendingVote');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      const { electionId, candidateId, quantity, returnUrl } = JSON.parse(pendingData);

      if (!electionId || !candidateId || !quantity) {
        setStatus('error');
        setMessage('Incomplete vote data. Please try again.');
        toast.error('Missing election/candidate information');
        sessionStorage.removeItem('pendingVote');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // 2. Verify payment with Khalti – send election metadata
        const verifyRes = await api.post('/payments/khalti/verify', {
          pidx,
          transaction_id: transactionId,
          status: statusParam,
          electionId,
          candidateId,
          quantity,
        });

        const paymentId = verifyRes.data.paymentId;

        // 3. Cast the vote
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
        } catch (voteErr) {
          const errorMsg = voteErr.response?.data?.error || '';
          if (errorMsg.toLowerCase().includes('already voted')) {
            setStatus('success');
            setMessage('You have already voted in this election.');
            toast.info('Vote already counted');
            sessionStorage.removeItem('pendingVote');
          } else {
            throw voteErr;
          }
        }

        const redirectTo = returnUrl || `/elections/${electionId}`;
        navigate(redirectTo, { replace: true });

      } catch (err) {
        console.error('Callback error:', err);
        setStatus('error');
        setMessage(err.response?.data?.error || 'Payment verification failed');
        toast.error('Failed to record vote');
        sessionStorage.removeItem('pendingVote');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    verifyAndVote();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center max-w-md w-full shadow-lg">
        {status === 'processing' && (
          <>
            <Loader2 className="animate-spin text-violet-600 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h2>
            <p className="text-gray-500">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="text-emerald-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-xs text-gray-400 mt-4">Redirecting...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-xs text-gray-400 mt-4">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}