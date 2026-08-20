import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Search, Mail, User, Building, MessageSquare, CheckCircle,
  XCircle, Clock, Archive, Trash2, ChevronLeft, ChevronRight,
  X, Send, Loader2, Phone,
} from 'lucide-react';
import NepaliDate from 'nepali-date-converter';

export default function ElectionRequestManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const toast = useToast();

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [replyTarget, setReplyTarget] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const formatBsDate = (adDateString) => {
    const date = new Date(adDateString);
    if (isNaN(date.getTime())) return '—';
    try {
      const npDate = new NepaliDate(date);
      const year = npDate.getYear();
      const month = String(npDate.getMonth()).padStart(2, '0');
      const day = String(npDate.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } catch {
      return '—';
    }
  };

  const formatBsDateTime = (adDateString) => {
    const date = new Date(adDateString);
    if (isNaN(date.getTime())) return '—';
    try {
      const npDate = new NepaliDate(date);
      const year = npDate.getYear();
      const month = String(npDate.getMonth()).padStart(2, '0');
      const day = String(npDate.getDate()).padStart(2, '0');
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${year}/${month}/${day} ${time}`;
    } catch {
      return '—';
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/election-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      toast.error('Failed to load election requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const refreshData = () => fetchRequests();

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/election-requests/${id}/status`, { status });
      toast.success(`Request marked as ${status}`);
      if (selectedRequest?.id === id) {
        setSelectedRequest(prev => ({ ...prev, status }));
      }
      refreshData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this request?')) return;
    try {
      await api.delete(`/admin/election-requests/${id}`);
      toast.success('Request deleted');
      if (selectedRequest?.id === id) setSelectedRequest(null);
      refreshData();
    } catch (err) {
      toast.error('Failed to delete request');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return toast.error('Reply message is required');
    if (!replyTarget) return;

    setSendingReply(true);
    try {
      await api.post(`/admin/election-requests/${replyTarget.id}/reply`, {
        message: replyMessage,
      });
      toast.success(`Reply sent to ${replyTarget.email}`);
      setReplyTarget(null);
      setReplyMessage('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700"><Clock size={12} /> Pending</span>;
      case 'REVIEWED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"><CheckCircle size={12} /> Reviewed</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700"><CheckCircle size={12} /> Completed</span>;
      case 'ARCHIVED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"><Archive size={12} /> Archived</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const filtered = requests.filter(req => {
    const searchMatch = !search ||
      (req.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (req.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (req.organization || '').toLowerCase().includes(search.toLowerCase()) ||
      (req.phone || '').toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'ALL' || req.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedRequests = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Election Requests</h2>
          <p className="text-gray-500 text-sm">Requests submitted via the public form</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-t-2 border-violet-500 rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No requests found.</div>
      ) : (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-4 text-left">Requester</th>
                    <th className="p-4 text-left">Phone</th>
                    <th className="p-4 text-left">Organization</th>
                    <th className="p-4 text-left">Message</th>
                    <th className="p-4 text-left">Date (BS)</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{req.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{req.email}</div>
                      </td>
                      <td className="p-4 text-gray-600">{req.phone || '—'}</td>
                      <td className="p-4 text-gray-600">{req.organization || '—'}</td>
                      <td
                        className="p-4 text-gray-600 max-w-xs truncate cursor-pointer hover:text-violet-600 hover:underline"
                        title="Click to view full message"
                        onClick={() => setSelectedRequest(req)}
                      >
                        {req.message}
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        {formatBsDate(req.createdAt)}
                      </td>
                      <td className="p-4">{getStatusBadge(req.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setReplyTarget(req)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                            title="Reply"
                          >
                            <Mail size={16} />
                          </button>
                          {req.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleStatusChange(req.id, 'REVIEWED')} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600" title="Mark Reviewed"><CheckCircle size={16} /></button>
                              <button onClick={() => handleStatusChange(req.id, 'COMPLETED')} className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600" title="Mark Completed"><CheckCircle size={16} /></button>
                            </>
                          )}
                          {req.status === 'REVIEWED' && (
                            <button onClick={() => handleStatusChange(req.id, 'COMPLETED')} className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600" title="Mark Completed"><CheckCircle size={16} /></button>
                          )}
                          <button onClick={() => handleStatusChange(req.id, 'ARCHIVED')} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600" title="Archive"><Archive size={16} /></button>
                          <button onClick={() => handleDelete(req.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600" title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"><ChevronLeft size={16} /></button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          )}
        </>
      )}

      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
                  <MessageSquare size={22} className="text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Election Request</h2>
                  <p className="text-sm text-gray-500">{getStatusBadge(selectedRequest.status)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Name</p>
                  <p className="text-gray-800 font-medium">{selectedRequest.name || '—'}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Phone</p>
                  <p className="text-gray-800">{selectedRequest.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Organization</p>
                  <p className="text-gray-800">{selectedRequest.organization || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Date & Time (BS)</p>
                  <p className="text-gray-800 text-sm">{formatBsDateTime(selectedRequest.createdAt)}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase mb-2">Message</p>
                <div className="bg-gray-50 rounded-xl p-4 text-gray-700 whitespace-pre-wrap max-h-70 overflow-y-auto">
                  {selectedRequest.message}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => {
                    setReplyTarget(selectedRequest);
                    setSelectedRequest(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium flex items-center gap-1"
                >
                  <Mail size={14} /> Reply
                </button>
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'REVIEWED')}
                      className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'COMPLETED')}
                      className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm font-medium"
                    >
                      Mark Completed
                    </button>
                  </>
                )}
                {selectedRequest.status === 'REVIEWED' && (
                  <button
                    onClick={() => handleStatusChange(selectedRequest.id, 'COMPLETED')}
                    className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm font-medium"
                  >
                    Mark Completed
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange(selectedRequest.id, 'ARCHIVED')}
                  className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                >
                  Archive
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {replyTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setReplyTarget(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setReplyTarget(null)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Mail size={20} className="text-violet-600" /> Reply to {replyTarget.name || replyTarget.email}
            </h3>
            <p className="text-sm text-gray-500 mb-4">To: <strong>{replyTarget.email}</strong></p>
            <form onSubmit={handleReply}>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={5}
                placeholder="Type your reply..."
                required
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-violet-500 resize-none mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium flex items-center gap-2 disabled:opacity-70"
                >
                  {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}