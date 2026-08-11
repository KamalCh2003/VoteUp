// src/components/voter/VoterBookmarks.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, Loader2, Trash2, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function VoterBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setBookmarks(prev => prev.filter(b => b.electionId !== electionId));
      toast.success('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

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

      {bookmarks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
          <p>No saved elections yet.</p>
          <Link to="/elections" className="text-violet-600 hover:underline">Browse elections →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((b) => {
            const isActive = b.status === 'ACTIVE';
            const isUpcoming = b.status === 'UPCOMING';
            return (
              <div key={b.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md transition group">
                <div className="flex-1 min-w-0">
                  <Link to={`/elections/${b.electionId}`} className="block">
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
                  <Link to={`/elections/${b.electionId}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-violet-600 transition"><ChevronRight size={18} /></Link>
                  <button onClick={() => removeBookmark(b.electionId)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"><Trash2 size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}