// src/components/contestant/CandidateHistory.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vote, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
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
        return (
          <span className="flex items-center gap-1 text-emerald-600">
            <CheckCircle size={14} /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 text-red-600">
            <XCircle size={14} /> Rejected
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-amber-600">
            <Clock size={14} /> Pending
          </span>
        );
      default:
        return <span className="text-gray-600">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 sm:py-10 text-gray-900">
      <div className="max-w-5xl mx-auto">


        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No candidacy history found.</p>
            <Link
              to="/contestant/apply"
              className="text-violet-600 hover:underline mt-2 inline-block"
            >
              Apply for candidacy 
            </Link>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-600">Election</th>
                    <th className="text-left py-4 px-6 text-gray-600">Candidate No.</th>
                    <th className="text-left py-4 px-6 text-gray-600">Party</th>
                    <th className="text-left py-4 px-6 text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-gray-600">Votes</th>
                    <th className="text-left py-4 px-6 text-gray-600">Applied On</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {history.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {c.election?.title || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {c.candidateNumber || '—'}
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {c.party || 'Independent'}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {c.votesReceived?.toLocaleString() || 0}
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="sm:hidden space-y-4">
              {history.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-gray-900 font-semibold text-lg">
                        {c.election?.title || 'N/A'}
                      </h3>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-xs">{getStatusBadge(c.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                    <div>
                      <span className="text-gray-500 text-xs">Candidate No.</span>
                      <p className="text-gray-900">{c.candidateNumber || '—'}</p>
                    </div>

                    <div>
                      <span className="text-gray-500 text-xs">Party</span>
                      <p className="text-gray-900">
                        {c.party || 'Independent'}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500 text-xs">Votes</span>
                      <p className="text-gray-900 font-medium">
                        {c.votesReceived?.toLocaleString() || 0}
                      </p>
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