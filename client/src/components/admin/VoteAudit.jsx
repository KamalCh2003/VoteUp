// src/components/admin/VoteAudit.jsx
import { useState, useEffect } from 'react';
import { Search, Users, Calendar, Eye } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function VoteAudit() {
  const [votes, setVotes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/votes')
      .then(({ data }) => setVotes(data.votes || []))
      .catch(() => toast.error('Failed to load votes'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = votes.filter(v =>
    v.user.email.toLowerCase().includes(search.toLowerCase()) ||
    v.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
    v.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
    v.candidate.user.firstName.toLowerCase().includes(search.toLowerCase())
  );

  // Demographics summary
  const genderStats = { MALE: 0, FEMALE: 0, OTHER: 0 };
  votes.forEach(v => {
    const g = v.user.gender || 'OTHER';
    genderStats[g]++;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400" /></div>;

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Vote Audit & Demographics</h2>
      
      {/* Demographics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center gap-2"><Users className="text-blue-400"/> Male Voters</div>
          <p className="text-3xl font-bold mt-2">{genderStats.MALE}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center gap-2"><Users className="text-pink-400"/> Female Voters</div>
          <p className="text-3xl font-bold mt-2">{genderStats.FEMALE}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
          <div className="flex items-center gap-2"><Users className="text-gray-400"/> Other/Unknown</div>
          <p className="text-3xl font-bold mt-2">{genderStats.OTHER}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-96 mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by voter or candidate name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white"
        />
      </div>

      {/* Votes Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm border-b border-white/10">
              <tr><th className="p-4">Voter</th><th className="p-4">Gender</th><th className="p-4">Voted For</th><th className="p-4">Party</th><th className="p-4">Election</th><th className="p-4">Time</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-white/5">
                  <td className="p-4">{v.user.firstName} {v.user.lastName}<div className="text-xs text-gray-400">{v.user.email}</div></td>
                  <td className="p-4">{v.user.gender || '—'}</td>
                  <td className="p-4">{v.candidate.user.firstName} {v.candidate.user.lastName}</td>
                  <td className="p-4">{v.candidate.user.party || 'Independent'}</td>
                  <td className="p-4">{v.election.title}</td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(v.votedAt).toLocaleString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No votes found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}