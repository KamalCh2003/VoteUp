// src/components/home/ElectionRequest.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ElectionRequestCTA() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-6">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-purple-600 p-8 md:p-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Ready to launch your next election?
            </h2>
            <p className="mt-3 max-w-2xl text-violet-100">
              Create secure elections, manage contestants, track votes
              in real-time, and engage your community with confidence.
            </p>
          </div>
          <Link
            to={user ? '/request-election' : '/register'}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-violet-700 shadow-lg transition hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}