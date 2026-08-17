// src/components/voter/VoterBookmarks.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, Loader2, Trash2, ChevronRight, Filter, Search } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function VoterBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/users/me/bookmarks');
      setBookmarks(res.data.bookmarks || res.data || []);
    } catch {
      toast.error('Failed to load bookmarks');
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (electionId) => {
    if (!confirm('Remove this bookmark?')) return;
    try {
      await api.delete(`/users/me/bookmarks/${electionId}`);
      setBookmarks(prev => prev.filter(b => b.id !== electionId));
      toast.success('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  const filtered = bookmarks
    .filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
                            b.category?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.endDate) - new Date(a.createdAt || a.endDate);
        case 'endingSoon':
          return new Date(a.endDate) - new Date(b.endDate);
        default:
          return 0;
      }
    });

  if (loading) {
    return <div className="flex justify-center items-center h-60"><Loader2 className="animate-spin text-violet-600" size={40} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark size={28} className="text-violet-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Saved Elections</h1>
          <p className="text-sm text-gray-500">{bookmarks.length} bookmarks</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-violet-500 outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Live</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="ENDED">Ended</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-violet-500 outline-none"
        >
          <option value="newest">Newest</option>
          <option value="endingSoon">Ending Soon</option>
        </select>

        {(search || statusFilter !== 'ALL' || sortBy !== 'newest') && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('ALL'); setSortBy('newest'); }}
            className="text-sm text-violet-600 hover:text-violet-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
          <p>{bookmarks.length === 0 ? 'No saved elections yet.' : 'No bookmarks match your filters.'}</p>
          {bookmarks.length === 0 && (
            <Link to="/elections" className="text-violet-600 hover:underline">Browse elections →</Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const isActive = b.status === 'ACTIVE';
            const isUpcoming = b.status === 'UPCOMING';
            return (
              <div key={b.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition group">
                <div className="flex-1 min-w-0">
                  <Link to={`/elections/${b.id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-violet-600 transition">{b.title}</h3>
                    <p className="text-sm text-gray-500">{b.category}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        isActive ? 'bg-emerald-100 text-emerald-700' :
                        isUpcoming ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {isActive ? 'Live' : isUpcoming ? 'Upcoming' : 'Ended'}
                      </span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(b.endDate).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/elections/${b.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-violet-600 transition"><ChevronRight size={18} /></Link>
                  <button onClick={() => removeBookmark(b.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"><Trash2 size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}