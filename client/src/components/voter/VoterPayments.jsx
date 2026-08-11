// src/components/voter/VoterPayments.jsx
import { useState, useEffect } from 'react';
import { CreditCard, Wallet, Loader2, Receipt, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function VoterPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSpent: 0, refunds: 0, count: 0 });
  const toast = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/users/me/payments');
      const data = res.data.payments || res.data || [];
      setPayments(data);
      const completed = data.filter(p => p.status === 'COMPLETED' || p.status === 'Success');
      const refunded = data.filter(p => p.status === 'REFUNDED' || p.status === 'Refunded');
      setStats({
        totalSpent: completed.reduce((sum, p) => sum + p.amount, 0),
        refunds: refunded.reduce((sum, p) => sum + p.amount, 0),
        count: data.length,
      });
    } catch {
      toast.error('Failed to load payment history');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-60"><Loader2 className="animate-spin text-violet-600" size={40} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Payments</h1>
      <p className="text-gray-500 mb-6">Your transaction history and spending summary.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">रू {stats.totalSpent.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center"><Wallet size={20} className="text-violet-600" /></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Refunds</p>
              <p className="text-2xl font-bold text-gray-900">रू {stats.refunds.toLocaleString()}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center"><Wallet size={20} className="text-amber-600" /></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><Receipt size={20} className="text-blue-600" /></div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Transaction</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-500">No transactions yet.</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">#TXN-{p.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 text-gray-700">{p.type || 'Vote Purchase'}</td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-900">रू {p.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'COMPLETED' || p.status === 'Success' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'REFUNDED' || p.status === 'Refunded' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs flex items-center gap-1"><Calendar size={12} /> {new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}