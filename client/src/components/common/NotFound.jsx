import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] text-center px-4">
      <GlassCard className="max-w-md">
        <div className="text-6xl font-bold text-[var(--a)]/30 mb-4">404</div>
        <div className="text-4xl mb-4">🗺️</div>
        <h2 className="text-xl font-semibold mb-2">Page not found</h2>
        <p className="text-sm text-[var(--t2)] mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="px-5 py-2 rounded-full bg-[var(--a)] text-white text-sm">Go Home</Link>
          <Link to="/voter/elections" className="px-5 py-2 rounded-full border border-[var(--gb)] text-sm">View Elections</Link>
        </div>
      </GlassCard>
    </div>
  );
}