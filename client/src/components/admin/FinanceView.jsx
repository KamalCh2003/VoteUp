import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  DollarSign, TrendingUp, ShoppingCart, CreditCard, Wallet,
  RefreshCw, Users, ArrowUpRight, ArrowDownRight, Smartphone
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function FinanceView() {
  const [payments, setPayments] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [topVoters, setTopVoters] = useState([]);
  const toast = useToast();

  useEffect(() => {
    // Fetch all data in parallel
    Promise.all([
      api.get('/payments/history'),
      api.get('/admin/finance/revenue-trend'),
      api.get('/admin/finance/payment-methods'),
      api.get('/admin/finance/top-voters'),
    ])
      .then(
        ([
          paymentsRes,
          revenueRes,
          methodsRes,
          votersRes,
        ]) => {
          setPayments(paymentsRes.data.payments || []);
          setRevenueData(revenueRes.data.revenueData || []);
          setPaymentMethods(methodsRes.data.methods || []);
          setTopVoters(votersRes.data.topVoters || []);
        }
      )
      .catch(() => toast.error('Failed to load finance data'));
  }, []);

  const totalRevenue = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = payments.length;
  const refunds = payments.filter((p) => p.status === 'REFUNDED').length;
  const avgTransaction = totalTransactions ? totalRevenue / totalTransactions : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <DollarSign size={24} className="text-emerald-400" />
          Finance & Revenue
        </h2>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 p-1">
          {['This Month', 'This Year', 'All Time'].map((period) => (
            <button
              key={period}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === 'This Month' ? 'bg-violet-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-emerald-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total Revenue</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <ArrowUpRight size={12} /> +12.5%
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <DollarSign size={22} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-violet-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Transactions</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalTransactions}</h3>
              <p className="text-xs text-violet-400 mt-2 flex items-center gap-1">
                <ShoppingCart size={12} /> All time
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <CreditCard size={22} className="text-violet-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-red-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Refunds</p>
              <h3 className="text-2xl font-bold text-white mt-1">{refunds}</h3>
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                <ArrowDownRight size={12} /> Processed
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <RefreshCw size={22} className="text-red-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-cyan-500/20 blur-xl"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Avg. Transaction</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                ${avgTransaction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1">
                <TrendingUp size={12} /> Per payment
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Wallet size={22} className="text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend (Line Chart) */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            Revenue Trend (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" stroke="#9090b8" fontSize={12} />
              <YAxis stroke="#9090b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#1c1c32',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#eeeeff' }}
              />
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

        {/* Payment Methods (Pie Chart) */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Smartphone size={18} className="text-violet-400" />
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1c1c32',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: '#eeeeff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Voters & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Voters */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={18} className="text-cyan-400" />
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
                    <p className="text-sm font-medium text-white">{voter.name}</p>
                    <p className="text-xs text-gray-400">{voter.votes} votes</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-semibold">
                  {/* Optional: show amount if you add it to the query */}
                </span>
              </div>
            ))}
            {topVoters.length === 0 && (
              <p className="text-gray-500 text-sm">No data yet.</p>
            )}
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ShoppingCart size={18} className="text-violet-400" />
            Recent Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">User</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.05] transition">
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {p.user?.firstName || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          p.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : p.status === 'REFUNDED'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
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