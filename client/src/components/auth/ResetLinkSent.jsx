// src/components/auth/ResetLinkSent.jsx
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { MailCheck, Loader2, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';

export default function ResetLinkSent() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const toast = useToast();

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset link resent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend reset link');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-3 overflow-hidden">
      <div className="w-full max-w-[380px] bg-white border border-gray-200 rounded-[28px] p-5 lg:p-6 shadow-xl text-center">
        <div className="flex justify-center mb-3">
          <div className="w-11 h-11 rounded-2xl bg-green-100 flex items-center justify-center">
            <MailCheck className="text-green-600" size={22} />
          </div>
        </div>
        <h2 className="text-gray-800 text-xl font-bold mb-2">Please, Check your email</h2>
        <p className="text-gray-500 text-sm mb-6">
          We sent a password reset link to{' '}
          <span className="text-violet-600 font-medium">{email}</span>
        </p>

        <p className="text-xs text-gray-400 mb-6">
          If you don't see it, check your spam folder or try resending.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleResend}
            disabled={resending}
            className="w-full h-11 rounded-full font-semibold"
            variant="secondary"
          >
            {resending ? (
              <Loader2 className="animate-spin mx-auto" size={18} />
            ) : (
              'Resend reset link'
            )}
          </Button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}