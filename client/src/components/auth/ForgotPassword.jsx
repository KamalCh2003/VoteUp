import { useState } from 'react';
import { forgotPassword } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      toast.success('If email exists, reset link sent');
    } catch (err) {
      toast.error('Error sending email');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full p-3 rounded-xl border border-[var(--gb)] bg-[var(--glass)] text-sm" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button type="submit" className="w-full">Send Reset Link</Button>
      </form>
    </div>
  );
}