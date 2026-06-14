// src/components/auth/RegisterForm.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('VOTER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      return toast.error('Please fill all required fields');
    }
    if (formData.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (formData.password !== formData.confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role,
      };
      const response = await register(payload);
      if (response.devOtp) {
        toast.success(`OTP (dev): ${response.devOtp}`);
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&otp=${response.devOtp}`);
      } else {
        toast.success('Account created! Check your email for the verification code.');
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Join thousands of verified voters" backTo="/">
      <div className="flex gap-2 mb-5 bg-gray-100 border border-gray-200 rounded-2xl p-1">
        <button
          type="button"
          onClick={() => setRole('VOTER')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
            role === 'VOTER' ? 'bg-violet-600 text-white' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Voter
        </button>
        <button
          type="button"
          onClick={() => setRole('CONTESTANT')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
            role === 'CONTESTANT' ? 'bg-violet-600 text-white' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Contestant
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password (min 8 characters)"
            value={formData.password}
            onChange={handleChange}
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

        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 pr-11 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
          >
            {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <div className="border border-violet-200 bg-violet-50 rounded-xl p-3 flex gap-3">
          <ShieldCheck size={16} className="text-violet-500 mt-0.5 flex-shrink-0" />
          <p className="text-gray-600 text-xs leading-relaxed">Your identity is verified securely and never shared.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-violet-600 hover:bg-violet-700 disabled:opacity-70 rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2 mt-1"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-gray-500 mt-5 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-violet-600 hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}