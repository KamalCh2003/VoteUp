// src/components/admin/FinanceView.jsx
import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  TrendingUp, ShoppingCart, CreditCard, Wallet,
  RefreshCw, Users, Smartphone
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
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [topVoters, setTopVoters] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenueRes, methodsRes, votersRes, paymentsRes] = await Promise.all([
          api.get('/admin/finance/revenue-trend'),
          api.get('/admin/finance/payment-methods'),
          api.get('/admin/finance/top-voters'),
          api.get('/admin/finance/recent-payments'),
        ]);
        setRevenueData(revenueRes.data.revenueData || []);
        setPaymentMethods(methodsRes.data.methods || []);
        setTopVoters(votersRes.data.topVoters || []);
        setRecentPayments(paymentsRes.data.payments || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load finance data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = recentPayments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = recentPayments.length;
  const refunds = recentPayments.filter(p => p.status === 'REFUNDED').length;
  const avgTransaction = totalTransactions ? totalRevenue / totalTransactions : 0;

  if (loading) {
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

      {/* Stat Cards - Light theme */}
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
              <p className="text-xs text-gray-500">Refunds</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{refunds}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
              <RefreshCw size={22} className="text-red-600" />
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
        {/* Revenue Trend */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" />
            Revenue Trend (Last 6 Months)
          </h3>
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

        {/* Payment Methods */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Smartphone size={18} className="text-violet-600" />
            Payment Methods (by Type)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentMethods}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentMethods.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Voters & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <p className="text-xs text-gray-500">{voter.votes} votes</p>
                  </div>
                </div>
              </div>
            ))}
            {topVoters.length === 0 && (
              <p className="text-gray-500 text-sm">No data yet.</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
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
                  <th className="py-3 px-4 text-gray-500 font-medium">User</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">Amount</th>
                  <th className="py-3 px-4 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {p.user?.firstName || p.user?.email || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium">
                      रू {p.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          p.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : p.status === 'REFUNDED'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
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
        </div>
      </div>
    </div>
  );
}