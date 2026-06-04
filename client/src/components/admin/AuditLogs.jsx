import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronRight, Shield, Clock } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/audit-logs')
      .then(({ data }) => setLogs(data.logs || []))
      .catch(() => toast.error('Failed to load audit logs'));
  }, []);

  // Extract unique event types for filter
  const eventTypes = ['ALL', ...new Set(logs.map(l => l.event))];

  const filtered = logs.filter(log => {
    const matchesSearch =
      log.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      log.event?.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress?.includes(search) ||
      log.result?.toLowerCase().includes(search.toLowerCase());
    const matchesEvent = eventFilter === 'ALL' || log.event === eventFilter;
    return matchesSearch && matchesEvent;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield size={24} className="text-violet-400" />
          Audit Logs
        </h2>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-purple-500/50 transition"
            />
          </div>

          {/* Event filter */}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
            >
              {eventTypes.map(type => (
                <option key={type} value={type} className="bg-[#1c1c32] text-white">
                  {type === 'ALL' ? 'All Events' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="text-left py-4 px-6 font-medium text-gray-400">Time</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Event</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">User</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Result</th>
                <th className="text-right py-4 px-6 font-medium text-gray-400">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="hover:bg-white/[0.05] transition cursor-pointer"
                    onClick={() => toggleExpand(log.id)}
                  >
                    <td className="py-4 px-6 text-gray-400 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        log.event.includes('LOGIN') ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                        log.event.includes('VOTE') ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' :
                        log.event.includes('PAYMENT') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        log.event.includes('FAILED') ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        'bg-gray-500/20 text-gray-300 border-gray-500/30'
                      }`}>
                        {log.event}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{log.user?.email || 'System'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        log.result === 'OK' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        log.result === 'Blocked' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-gray-400 hover:text-white transition">
                        {expandedId === log.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                  </tr>
                  {/* Expandable row */}
                  {expandedId === log.id && (
                    <tr key={`${log.id}-details`} className="bg-white/[0.02]">
                      <td colSpan={5} className="py-4 px-6 text-gray-400 text-xs">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex gap-2">
                            <span className="text-gray-500">IP:</span>
                            <span className="text-white">{log.ipAddress || 'N/A'}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500">Details:</span>
                            <span className="text-white">{log.details || 'No additional details'}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No audit logs found.
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