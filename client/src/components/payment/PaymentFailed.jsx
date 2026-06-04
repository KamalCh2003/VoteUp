import { Link } from 'react-router-dom';
import GlassCard from '../common/GlassCard';

export default function PaymentFailed() {
  return (
    <div className="mt-8 text-center">
      <div className="text-4xl mb-4">❌</div>
      <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
      <p className="text-sm text-[var(--t2)] mb-4">Please try again or contact support.</p>
      <Link to="/payment/candidacy" className="text-[var(--a)] underline">Try Again</Link>
    </div>
  );
}