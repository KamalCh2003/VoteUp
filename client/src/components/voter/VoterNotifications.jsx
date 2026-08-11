// src/components/voter/VoterNotifications.jsx
import { useState, useEffect } from 'react';
import { Bell, Check, Clock, Loader2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function VoterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const clearAll = async () => {
    if (!confirm('Delete all notifications?')) return;
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      toast.success('Cleared');
    } catch {
      toast.error('Failed to clear');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-60"><Loader2 className="animate-spin text-violet-600" size={40} /></div>;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500">{unreadCount} unread</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              <Check size={16} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition">
              <Trash2 size={16} /> Clear all
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div key={notif.id} className={`flex items-start gap-4 p-4 rounded-xl border ${notif.isRead ? 'border-gray-200 bg-white' : 'border-violet-200 bg-violet-50'}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.isRead ? 'bg-gray-100 text-gray-500' : 'bg-violet-100 text-violet-600'}`}>
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={12} /> {new Date(notif.createdAt).toLocaleString()}</p>
              </div>
              {!notif.isRead && (
                <button onClick={() => markAsRead(notif.id)} className="text-xs text-violet-600 hover:underline whitespace-nowrap">Mark read</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}