const stripe = require('../config/stripe');

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
  });
  return paymentIntent;
};

const retrievePaymentIntent = async (paymentIntentId) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

module.exports = { createPaymentIntent, retrievePaymentIntent };