// src/components/payment/PaymentCallback.jsx
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

      console.log('Payment callback params:', {
        pidx,
        transactionId,
        status: statusParam,
        all: Object.fromEntries(searchParams.entries()),
      });

      
      if (!pidx || statusParam !== 'Completed') {
        setStatus('error');
        const errorMsg = statusParam
          ? `Payment ${statusParam}.`
          : 'Payment failed or cancelled.';
        setMessage(errorMsg);
        toast.error(errorMsg);
        sessionStorage.removeItem('pendingVote');

        // Redirect after 3 seconds
        const pendingData = sessionStorage.getItem('pendingVote');
        let redirectUrl = '/';
        if (pendingData) {
          try {
            const parsed = JSON.parse(pendingData);
            redirectUrl = parsed.returnUrl || `/elections/${parsed.electionId}`;
          } catch {}
        }
        sessionStorage.removeItem('pendingVote');
        setTimeout(() => navigate(redirectUrl, { replace: true }), 3000);
        return;
      }

      // Payment is 'Completed' – proceed with verification
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
        const verifyRes = await api.post('/payments/khalti/verify', {
          pidx,
          transaction_id: transactionId,
          status: statusParam,
          electionId,
          candidateId,
          quantity,
        });

        const { voteCasted, voteError } = verifyRes.data;

        if (voteCasted) {
          setStatus('success');
          setMessage(`${quantity} vote(s) cast successfully!`);
          toast.success('Vote recorded!');
        } else if (voteError) {
          setStatus('success');
          setMessage(voteError);
          toast(voteError);
        } else {
          setStatus('error');
          setMessage('Unknown error occurred. Please contact support.');
          toast.error('Unknown error');
        }

        sessionStorage.removeItem('pendingVote');

        const redirectTo = returnUrl || `/elections/${electionId}`;
        setTimeout(() => navigate(redirectTo, { replace: true }), 2000);
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