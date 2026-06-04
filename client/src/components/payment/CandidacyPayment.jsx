import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPaymentIntent, confirmPayment } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';

export default function CandidacyPayment() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data } = await createPaymentIntent({ amount: 50, type: 'CANDIDACY_FEE' });
      // In production, use Stripe Elements; here we simulate
      await confirmPayment('simulated_intent_id');
      toast.success('Payment successful');
      navigate('/payment/success');
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4">Candidacy Fee ($50)</h2>
      <Button onClick={handlePay} disabled={loading} className="w-full">
        {loading ? 'Processing...' : 'Pay $50'}
      </Button>
    </div>
  );
}