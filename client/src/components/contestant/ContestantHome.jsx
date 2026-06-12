import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
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
        <Loader2 className="animate-spin text-violet-400" size={48} />
      </div>
    );
  }

  // If already a candidate (any status), redirect to the main dashboard
  if (candidacy) {
    return <Navigate to="/contestant/dashboard" replace />;
  }

  // Otherwise, show the "apply for candidacy" prompt
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
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