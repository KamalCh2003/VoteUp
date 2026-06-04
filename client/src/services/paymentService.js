import api from './api';

export const createPaymentIntent = (data) => api.post('/payments/create-intent', data);
export const confirmPayment = (paymentIntentId) => api.post('/payments/confirm', { paymentIntentId });
export const getWallet = () => api.get('/payments/wallet');