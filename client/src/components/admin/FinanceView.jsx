// src/components/admin/FinanceView.jsx
import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, ShoppingCart, CreditCard, Wallet,
  Users, Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Custom tooltip for light theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-md">
        <p className="text-gray-700 text-sm">{label}</p>
        <p className="text-emerald-600 font-bold">
          रू {payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function FinanceView() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [topVoters, setTopVoters] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [revenueRange, setRevenueRange] = useState('THIS_YEAR');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const toast = useToast();

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [revenueRes, votersRes, paymentsRes] = await Promise.all([
        api.get('/admin/finance/revenue-trend', { params: { range: revenueRange } }),
        api.get('/admin/finance/top-voters'),
        api.get('/admin/finance/recent-payments'),
      ]);
      setRevenueData(revenueRes.data.revenueData || []);
      setTopVoters(votersRes.data.topVoters || []);
      setRecentPayments(paymentsRes.data.payments || []);
      setCurrentPage(1); // reset to first page after fresh data
    } catch (err) {
      console.error(err);
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [revenueRange]);

  // Pagination logic for recent payments
  const totalPages = Math.ceil(recentPayments.length / itemsPerPage);
  const paginatedPayments = recentPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  const totalRevenue = recentPayments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = recentPayments.length;
  const failedTransactions = recentPayments.filter(p => p.status === 'FAILED').length;
  const avgTransaction = totalTransactions ? totalRevenue / totalTransactions : 0;

  if (loading && !revenueData.length) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-emerald-600 font-bold text-2xl">रू</span>
          Finance & Revenue
        </h2>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-emerald-100 opacity-50"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                रू {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-2xl">रू</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-violet-100 opacity-50"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Transactions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalTransactions}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <CreditCard size={22} className="text-violet-600" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-red-100 opacity-50"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Failed Transactions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{failedTransactions}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Wallet size={22} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-cyan-100 opacity-50"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Avg. Transaction</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                रू {avgTransaction.toFixed(2)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
              <Wallet size={22} className="text-cyan-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend with range selector */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              Revenue Trend
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-violet-500" />
              <select
                value={revenueRange}
                onChange={(e) => setRevenueRange(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-gray-700 outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="LAST_MONTH">Last Month</option>
                <option value="LAST_3_MONTHS">Last 3 Months</option>
                <option value="LAST_6_MONTHS">Last 6 Months</option>
                <option value="THIS_YEAR">This Year</option>
                <option value="LAST_5_YEARS">Last 5 Years</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} />
              <YAxis stroke="#888888" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#7c6fff"
                strokeWidth={3}
                dot={{ r: 5, fill: '#7c6fff', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#7c6fff', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Voters */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-cyan-600" />
            Top Voters (Most Active)
          </h3>
          <div className="space-y-4">
            {topVoters.map((voter, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {voter.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{voter.name}</p>
                    <p className="text-xs text-gray-500">{voter.votes} times voted</p>
                  </div>
                </div>
              </div>
            ))}
            {topVoters.length === 0 && (
              <p className="text-gray-500 text-sm">No data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions with pagination */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingCart size={18} className="text-violet-600" />
          Recent Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-3 px-4 text-gray-500 font-medium">Date</th>
                <th className="py-3 px-4 text-gray-500 font-medium">Voter</th>
                <th className="py-3 px-4 text-gray-500 font-medium">Contestant</th>
                <th className="py-3 px-4 text-gray-500 font-medium">Amount</th>
                <th className="py-3 px-4 text-gray-500 font-medium">Votes</th>
                <th className="py-3 px-4 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {p.voterName || (p.user?.firstName || p.user?.email || 'N/A')}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {p.contestantName || '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    रू {p.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {p.totalVotes ?? 0}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                        p.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}