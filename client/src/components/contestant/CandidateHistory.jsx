// src/components/contestant/CandidateHistory.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Vote, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CandidateHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/candidates/history');
      setHistory(data.history || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="flex items-center gap-1 text-emerald-400"><CheckCircle size={14}/> Approved</span>;
      case 'REJECTED':
        return <span className="flex items-center gap-1 text-red-400"><XCircle size={14}/> Rejected</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 text-amber-400"><Clock size={14}/> Pending</span>;
      default:
        return <span>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-violet-400" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <Vote size={20} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Candidacy History</h1>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No candidacy history found.</p>
            <Link to="/contestant/apply" className="text-violet-400 hover:underline mt-2 inline-block">
              Apply for an election →
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table (visible on sm and up) */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
              <table className="w-full text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-400">Election</th>
                    <th className="text-left py-4 px-6 text-gray-400">Candidate No.</th>
                    <th className="text-left py-4 px-6 text-gray-400">Party</th>
                    <th className="text-left py-4 px-6 text-gray-400">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400">Votes</th>
                    <th className="text-left py-4 px-6 text-gray-400">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-6 text-white font-medium">{c.election?.title || 'N/A'}</td>
                      <td className="py-4 px-6 text-gray-300">{c.candidateNumber || '—'}</td>
                      <td className="py-4 px-6 text-gray-300">{c.party || 'Independent'}</td>
                      <td className="py-4 px-6">{getStatusBadge(c.status)}</td>
                      <td className="py-4 px-6 text-white">{c.votesReceived?.toLocaleString() || 0}</td>
                      <td className="py-4 px-6 text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards (visible only on screens < 640px) */}
            <div className="sm:hidden space-y-4">
              {history.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{c.election?.title || 'N/A'}</h3>
                      <p className="text-gray-400 text-xs mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-xs">{getStatusBadge(c.status)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                    <div>
                      <span className="text-gray-400 text-xs">Candidate No.</span>
                      <p className="text-white">{c.candidateNumber || '—'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Party</span>
                      <p className="text-white">{c.party || 'Independent'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Votes Received</span>
                      <p className="text-white font-medium">{c.votesReceived?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}