// src/components/payment/VotePaymentPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, CreditCard, Smartphone, CheckCircle, Loader2, Shield, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export default function VotePaymentPage() {
  const { user, refreshUser } = useAuth(); // assume refreshUser updates user balance
  const navigate = useNavigate();
  const toast = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Tiered pricing: more votes = lower per‑vote price
  const getPricePerVote = (qty) => {
    if (qty >= 21) return 80;
    if (qty >= 11) return 90;
    return 100;
  };
  
  const pricePerVote = getPricePerVote(quantity);
  const totalAmount = quantity * pricePerVote;
  
  const increment = () => setQuantity(prev => Math.min(prev + 1, 100));
  const decrement = () => setQuantity(prev => Math.max(prev - 1, 1));
  
  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    
    setProcessing(true);
    try {
      // Replace with real backend call
      // const { data } = await api.post('/payments/vote-credits', {
      //   quantity,
      //   amount: totalAmount,
      //   method: paymentMethod,
      // });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // After success, update user's vote balance (simulate)
      // await refreshUser(); // re‑fetch user to get new credit balance
      
      toast.success(`Purchased ${quantity} vote credit(s) for रू ${totalAmount}!`);
      navigate('/voter/wallet');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Please login first</h2>
          <button onClick={() => navigate('/login')} className="text-violet-400">Go to Login</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0B1020] to-black">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
          <ArrowLeft size={18} /> Back
        </button>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Purchase Vote Credits</h1>
          <p className="text-gray-400">Buy vote credits – each credit = one vote. Bulk pricing available.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Quantity Selector & Summary */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Select Number of Votes</h2>
            
            <div className="flex items-center justify-between bg-[#12121b] border border-white/10 rounded-xl p-4 mb-6">
              <button
                onClick={decrement}
                className="h-10 w-10 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center"
              >
                <Minus size={18} />
              </button>
              <span className="text-3xl font-bold text-white">{quantity}</span>
              <button
                onClick={increment}
                className="h-10 w-10 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span>Price per vote</span>
                <span className="font-mono">रू {pricePerVote}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span>Quantity</span>
                <span className="font-mono">{quantity}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold text-white">
                <span>Total</span>
                <span className="text-violet-400">रू {totalAmount.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Bulk discount hint */}
            <div className="mt-4 text-xs text-gray-500">
              {quantity < 11 && "Buy 11+ votes for रू 90 each | 21+ for रू 80 each"}
              {quantity >= 11 && quantity < 21 && "✓ You're getting the रू 90 per vote discount!"}
              {quantity >= 21 && "✓ Best discount: रू 80 per vote!"}
            </div>
          </div>
          
          {/* Right: Payment Methods (unchanged) */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Choose Payment Method</h2>
            
            <div className="space-y-4 mb-8">
              <button
                onClick={() => setPaymentMethod('khalti')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition ${
                  paymentMethod === 'khalti' ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Wallet size={24} className="text-violet-400" />
                <span className="flex-1 text-left text-white font-medium">Khalti</span>
                {paymentMethod === 'khalti' && <CheckCircle size={20} className="text-emerald-400" />}
              </button>
              <button
                onClick={() => setPaymentMethod('esewa')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition ${
                  paymentMethod === 'esewa' ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <CreditCard size={24} className="text-emerald-400" />
                <span className="flex-1 text-left text-white font-medium">eSewa</span>
                {paymentMethod === 'esewa' && <CheckCircle size={20} className="text-emerald-400" />}
              </button>
              <button
                onClick={() => setPaymentMethod('mobile_banking')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition ${
                  paymentMethod === 'mobile_banking' ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Smartphone size={24} className="text-cyan-400" />
                <span className="flex-1 text-left text-white font-medium">Mobile Banking</span>
                {paymentMethod === 'mobile_banking' && <CheckCircle size={20} className="text-emerald-400" />}
              </button>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={processing || !paymentMethod}
              className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                processing || !paymentMethod
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg'
              }`}
            >
              {processing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>Pay रू {totalAmount.toLocaleString()}</>
              )}
            </button>
            
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 justify-center">
              <Shield size={14} />
              <span>Secure payment. Your vote credits will be added immediately.</span>
            </div>
          </div>
        </div>
        
        {/* Info note */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Each vote credit allows you to cast one vote in any active election.</p>
          <p>You may vote only once per election, but you can buy as many credits as you like for different elections.</p>
        </div>
      </div>
    </div>
  );
}