// src/components/common/NotFound.jsx
import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] text-center px-4">
      <GlassCard className="max-w-md">
        <div className="text-6xl font-bold text-violet-300 mb-4">404</div>
        <div className="text-4xl mb-4">🗺️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Page not found</h2>
        <p className="text-sm text-gray-500 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="px-5 py-2 rounded-full bg-violet-600 text-white text-sm hover:bg-violet-700 transition">Go Home</Link>
          <Link to="/voter/elections" className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition">View Elections</Link>
        </div>
      </GlassCard>
    </div>
  );
}