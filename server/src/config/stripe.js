let stripe;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️ STRIPE_SECRET_KEY not set – payment features will be disabled.');
  // Provide a mock that throws helpful errors when payment methods are called
  stripe = {
    paymentIntents: {
      create: () => Promise.reject(new Error('Stripe not configured. Set STRIPE_SECRET_KEY in .env')),
      retrieve: () => Promise.reject(new Error('Stripe not configured. Set STRIPE_SECRET_KEY in .env')),
    },
  };
}

module.exports = stripe;