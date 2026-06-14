// src/components/admin/NotificationCenter.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, XCircle, Clock, Loader2, Eye, Inbox } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Helper: format date as "Today", "Yesterday", "Last week", "1 month ago", etc.
const formatRelativeDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = now.getMonth() - date.getMonth() + 12 * (now.getFullYear() - date.getFullYear());
  const diffYears = now.getFullYear() - date.getFullYear();

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return 'Last week';
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  if (diffYears === 1) return '1 year ago';
  return `${diffYears} years ago`;
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const toast = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/notifications', { params: { page, limit: 20 } });
      setNotifications(res.data.notifications || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/admin/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, [page]);

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'VOTE_CONFIRMED':
        return <CheckCircle size={18} className="text-emerald-600" />;
      case 'PAYMENT_SUCCESS':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'PAYMENT_FAILED':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return <Bell size={18} className="text-violet-600" />;
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <div className="flex items-center justify-end text-xs text-gray-500  mb-6">
  
          {notifications.filter(n => !n.isRead).length} unread
        
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-violet-600" size={40} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Inbox size={48} className="mx-auto mb-4 opacity-30" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                to={notif.link || '#'}
                className={`block rounded-2xl bg-white border border-gray-200 shadow-sm p-5 transition hover:bg-gray-50 ${
                  !notif.isRead ? 'border-l-4 border-l-violet-500' : ''
                }`}
                title={new Date(notif.createdAt).toLocaleString()}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatRelativeDate(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                    {!notif.isRead && (
                      <button
                        onClick={(e) => markAsRead(notif.id, e)}
                        className="mt-3 text-xs text-violet-600 hover:text-violet-700 transition flex items-center gap-1"
                      >
                        <Eye size={12} /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm disabled:opacity-50 hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}