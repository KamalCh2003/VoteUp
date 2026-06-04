import { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/payments/wallet')
      .then(({ data }) => setWallet(data.wallet))
      .catch(() => {});
  }, []);

  const handleTopUp = async () => {
    if (!amount) return;
    try {
      const { data } = await api.post('/payments/create-intent', { amount: parseFloat(amount), type: 'WALLET_TOPUP' });
      // Simulate confirmation
      await api.post('/payments/confirm', { paymentIntentId: 'simulated' });
      toast.success('Wallet topped up!');
      setWallet(prev => ({ ...prev, balance: prev.balance + parseFloat(amount) }));
      setAmount('');
    } catch (err) {
      toast.error('Top-up failed');
    }
  };

  return (
    <div className="mt-6 max-w-md mx-auto">
      <GlassCard>
        <h2 className="text-lg font-semibold mb-4">My Wallet</h2>
        <p className="text-2xl font-bold text-[var(--a2)] mb-4">${wallet?.balance?.toFixed(2) || '0.00'}</p>
        <div className="flex gap-2">
          <input type="number" className="flex-1 p-2 rounded-xl border border-[var(--gb)] bg-[var(--glass)] text-sm" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button variant="primary" onClick={handleTopUp}>Top Up</Button>
        </div>
      </GlassCard>
    </div>
  );
}