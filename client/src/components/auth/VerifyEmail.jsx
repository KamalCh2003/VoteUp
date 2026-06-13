// src/components/auth/VerifyEmail.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const preOtp = searchParams.get('otp') || '';
  const [otp, setOtp] = useState(preOtp);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { setAuth } = useAuth();

  const getDashboardPath = (role) => {
    switch (role) {
      case 'VOTER':
        return '/voter/home';
      case 'CONTESTANT':
        return '/contestant/profile-campaign';
      default:
        return '/dashboard';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter the 6-digit code');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      const { accessToken, refreshToken, user } = data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Email verified! Logging you in...');
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      if (data.devOtp) {
        setOtp(data.devOtp);
        toast.success(`New OTP: ${data.devOtp}`);
      } else {
        toast.success('OTP resent to your email.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Resend failed');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-3 overflow-hidden">
      <div className="w-full max-w-[380px] bg-white border border-gray-200 rounded-[28px] p-5 lg:p-6 shadow-xl text-center">
        <div className="flex justify-center mb-3">
          <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ShieldCheck className="text-green-600" size={22} />
          </div>
        </div>
        <h2 className="text-gray-800 text-xl font-bold mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm mb-6">
          We sent a 6‑digit code to <span className="text-violet-600">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={otp[i] || ''}
                onChange={(e) => {
                  const newOtp = otp.split('');
                  newOtp[i] = e.target.value.replace(/\D/g, '');
                  setOtp(newOtp.join(''));
                  if (e.target.value && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                }}
                id={`otp-${i}`}
                className="w-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-800 text-xl font-semibold outline-none focus:border-violet-500"
              />
            ))}
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 rounded-full font-semibold">
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Verify Code'}
          </Button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          Didn't receive the code?{' '}
          <button onClick={handleResend} disabled={resending} className="text-violet-600 hover:underline">
            {resending ? 'Sending…' : 'Resend'}
          </button>
        </div>
      </div>
    </div>
  );
}