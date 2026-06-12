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
      // Refresh the list
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-violet-400" />
      </div>
    );
  }

  if (error && votes.length === 0) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-gray-500 mb-4" />
        <p className="text-gray-400">{error}</p>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Vote Verifier</h2>
          <p className="text-gray-400 text-sm">Inspect and manage every vote</p>
          {votes.length > 0 && (
            <p className="text-xs text-emerald-400 mt-1">Total votes: {votes.length}</p>
          )}
        </div>
        <div className="relative w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by voter or candidate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm border-b border-white/10">
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
            <tbody className="divide-y divide-white/5">
              {filtered.map(vote => (
                <tr key={vote.id} className="hover:bg-white/5 transition">
                  <td className="p-4 font-medium text-white">{vote.user?.firstName} {vote.user?.lastName}</td>
                  <td className="p-4 text-gray-300">{vote.user?.email}</td>
                  <td className="p-4">{vote.candidate?.user?.firstName} {vote.candidate?.user?.lastName}</td>
                  <td className="p-4 text-gray-300">{vote.election?.title}</td>
                  <td className="p-4">{vote.quantity ?? 1}</td>
                  <td className="p-4 text-gray-400">{new Date(vote.votedAt).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(vote.id, `${vote.user?.firstName} ${vote.user?.lastName}`, `${vote.candidate?.user?.firstName} ${vote.candidate?.user?.lastName}`)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
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