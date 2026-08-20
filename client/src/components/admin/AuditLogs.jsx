import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronRight, Shield, Clock, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import NepaliDate from 'nepali-date-converter';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const toast = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatBsDateTime = (adDateString) => {
    const date = new Date(adDateString);
    if (isNaN(date.getTime())) return '—';
    try {
      const npDate = new NepaliDate(date);
      const year = npDate.getYear();
      const month = String(npDate.getMonth()).padStart(2, '0');
      const day = npDate.getDate();
      const time = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${year}/${month}/${day} ${time}`;
    } catch {
      return '—';
    }
  };

  useEffect(() => {
    api.get('/admin/audit-logs')
      .then(({ data }) => setLogs(data.logs || []))
      .catch(() => toast.error('Failed to load audit logs'));
  }, []);

  const eventTypes = ['ALL', ...new Set(logs.map(l => l.event))];

  const filtered = logs.filter(log => {
    const matchesSearch =
      log.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.role?.toLowerCase().includes(search.toLowerCase()) ||
      log.event?.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress?.includes(search) ||
      log.result?.toLowerCase().includes(search.toLowerCase());
    const matchesEvent = eventFilter === 'ALL' || log.event === eventFilter;
    return matchesSearch && matchesEvent;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, eventFilter]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentLogs = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getRoleBadge = (role) => {
    if (!role) return <span className="badge badge-neutral">System</span>;
    switch (role) {
      case 'ADMIN':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">Admin</span>;
      case 'CONTESTANT':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-200">Contestant</span>;
      case 'VOTER':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">Voter</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">{role}</span>;
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield size={24} className="text-violet-600" />
          Audit Logs
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-500 transition"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 outline-none focus:border-violet-500 appearance-none cursor-pointer"
            >
              {eventTypes.map(type => (
                <option key={type} value={type} className="bg-white text-gray-800">
                  {type === 'ALL' ? 'All Events' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-medium text-gray-500">Time (BS)</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500">Event</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500">User</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500">Role</th>
                <th className="text-left py-4 px-6 font-medium text-gray-500">Result</th>
                <th className="text-right py-4 px-6 font-medium text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentLogs.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => toggleExpand(log.id)}
                  >
                    <td className="py-4 px-6 text-gray-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {formatBsDateTime(log.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        log.event.includes('LOGIN') ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                        log.event.includes('VOTE') ? 'bg-violet-100 text-violet-700 border-violet-200' :
                        log.event.includes('PAYMENT') ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        log.event.includes('FAILED') ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {log.event}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{log.user?.email || 'System'}</td>
                    <td className="py-4 px-6">{getRoleBadge(log.user?.role)}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        log.result === 'OK' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        log.result === 'Blocked' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-gray-500 hover:text-gray-700 transition">
                        {expandedId === log.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr key={`${log.id}-details`} className="bg-gray-50">
                      <td colSpan={6} className="py-4 px-6 text-gray-600 text-xs">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-2">
                            <span className="text-gray-500">IP:</span>
                            <span className="text-gray-800">{log.ipAddress || 'N/A'}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500">Details:</span>
                            <span className="text-gray-800">{log.details || 'No additional details'}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {currentLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}–{endIndex} of {totalItems} logs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      currentPage === page
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Next page"
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}