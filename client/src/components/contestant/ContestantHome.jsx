import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vote, BarChart3, History, ArrowRight, Users, Clock, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ContestantHome() {
  const { user } = useAuth();
  const [candidacy, setCandidacy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/candidates/me')
      .then(({ data }) => setCandidacy(data.candidate))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400"></div>
      </div>
    );
  }

  // If no candidacy exists, prompt to apply
  if (!candidacy) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Shield size={28} className="text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">You are not a candidate yet</h2>
          <p className="text-gray-400 mb-6">Apply for an election to start your campaign.</p>
          <Link
            to="/contestant/apply"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-3 text-sm font-medium text-white hover:bg-violet-600 transition"
          >
            Apply for Candidacy <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Welcome back, {user?.firstName || 'Contestant'}!
          </h1>
          <p className="text-gray-400 mt-2">
            Monitor your campaign performance and track your votes.
          </p>
        </div>

        {/* Stats Cards (Real data) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-6">
            <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-violet-500/20 blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Votes Received</p>
                <p className="text-3xl font-bold mt-2">{candidacy.votesReceived.toLocaleString()}</p>
              </div>
              <Vote className="text-violet-400" size={32} />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-6">
            <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-emerald-500/20 blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Election</p>
                <p className="text-2xl font-bold mt-2">{candidacy.election?.title || 'N/A'}</p>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live
                </p>
              </div>
              <BarChart3 className="text-emerald-400" size={32} />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] p-6">
            <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-cyan-500/20 blur-xl"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-2xl font-bold mt-2">{candidacy.status}</p>
                <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  {candidacy.party || 'Independent'}
                </p>
              </div>
              <Users className="text-cyan-400" size={32} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/contestant/dashboard"
            className="group flex items-center justify-between bg-[#0B1020] border border-white/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all"
          >
            <div>
              <h2 className="text-xl font-semibold">Full Dashboard</h2>
              <p className="text-gray-400 mt-1">View detailed statistics and vote trends</p>
            </div>
            <ArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/contestant/history"
            className="group flex items-center justify-between bg-[#0B1020] border border-white/10 rounded-2xl p-6 hover:border-violet-500/30 transition-all"
          >
            <div>
              <h2 className="text-xl font-semibold">Campaign History</h2>
              <p className="text-gray-400 mt-1">Past elections and your performance</p>
            </div>
            <ArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}