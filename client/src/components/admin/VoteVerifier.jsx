// src/components/admin/VoteVerifier.jsx
import { useState, useEffect } from 'react';
import { Search, Trash2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function VoteVerifier() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      setError(null);
      const res = await api.get('/admin/votes');
      setVotes(res.data.votes || []);
      if (res.data.votes?.length === 0) {
        setError('No votes have been cast yet.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load votes');
      toast.error('Failed to load votes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (voteId, voterName, candidateName) => {
    if (!window.confirm(`Delete vote from ${voterName} for ${candidateName}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/votes/${voteId}`);
      toast.success('Vote deleted');
      fetchVotes();
    } catch (err) {
      toast.error('Failed to delete vote');
    }
  };

  const filtered = votes.filter(v => 
    v.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    `${v.user?.firstName} ${v.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    `${v.candidate?.user?.firstName} ${v.candidate?.user?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (error && votes.length === 0) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={fetchVotes}
          className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm hover:bg-violet-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 text-gray-800">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vote Verifier</h2>
          <p className="text-gray-500 text-sm">Inspect and manage every vote</p>
          {votes.length > 0 && (
            <p className="text-xs text-emerald-600 mt-1">Total votes: {votes.length}</p>
          )}
        </div>
        <div className="relative w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by voter or candidate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
              <tr>
                <th className="p-4">Voter</th>
                <th className="p-4">Email</th>
                <th className="p-4">Voted For</th>
                <th className="p-4">Election</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Voted At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(vote => (
                <tr key={vote.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{vote.user?.firstName} {vote.user?.lastName}</td>
                  <td className="p-4 text-gray-600">{vote.user?.email}</td>
                  <td className="p-4 text-gray-900">{vote.candidate?.user?.firstName} {vote.candidate?.user?.lastName}</td>
                  <td className="p-4 text-gray-600">{vote.election?.title}</td>
                  <td className="p-4 text-gray-700">{vote.quantity ?? 1}</td>
                  <td className="p-4 text-gray-500">{new Date(vote.votedAt).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(vote.id, `${vote.user?.firstName} ${vote.user?.lastName}`, `${vote.candidate?.user?.firstName} ${vote.candidate?.user?.lastName}`)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
                      title="Delete vote"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && votes.length > 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No matching votes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}