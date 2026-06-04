import { Link } from 'react-router-dom';
import GlassCard from '../common/GlassCard';

export default function PaymentSuccess() {
  return (
    <div className="mt-8 text-center">
      <div className="text-4xl mb-4">🎉</div>
      <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
      <p className="text-sm text-[var(--t2)] mb-4">Your application has been submitted.</p>
      <Link to="/" className="text-[var(--a)] underline">Return to Dashboard</Link>
    </div>
  );
}