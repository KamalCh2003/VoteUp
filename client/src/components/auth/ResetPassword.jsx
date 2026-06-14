import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AuthLayout from './AuthLayout';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (!tokenParam) {
      toast.error('Invalid or missing reset token');
      navigate('/forgot-password');
    } else {
      setToken(tokenParam);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Password reset failed';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password for your account" backTo="/login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm mb-1">New Password *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="•••••••• (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 pr-11 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-1">Confirm Password *</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 pr-11 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-70 rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Reset Password'}
        </button>
      </form>

      <p className="text-center text-gray-500 mt-5 text-sm">
        Remember your password?{' '}
        <Link to="/login" className="text-violet-600 hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}