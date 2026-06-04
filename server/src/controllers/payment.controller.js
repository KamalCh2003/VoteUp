const paymentService = require('../services/payment.service');
const prisma = require('../config/database');

exports.createIntent = async (req, res) => {
  try {
    const { amount, type, candidateId } = req.body;
    const intent = await paymentService.createPaymentIntent(amount, 'usd', {
      userId: req.user.id,
      type,
      candidateId: candidateId || '',
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ error: 'Payment intent creation failed' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const intent = await paymentService.retrievePaymentIntent(paymentIntentId);
    if (intent.status !== 'succeeded') return res.status(400).json({ error: 'Payment not successful' });

    const { userId, type, candidateId } = intent.metadata;
    const amount = intent.amount / 100;

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        type: type || 'CANDIDACY_FEE',
        status: 'COMPLETED',
        stripePaymentIntentId: paymentIntentId,
        candidateId: candidateId || null,
      },
    });

    if (type === 'WALLET_TOPUP') {
      await prisma.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      });
    }

    res.json({ payment });
  } catch (err) {
    res.status(500).json({ error: 'Confirmation failed' });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    res.json({ wallet });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
};