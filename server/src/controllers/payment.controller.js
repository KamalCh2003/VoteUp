const axios = require('axios');
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
    console.error('createIntent error:', err);
    res.status(500).json({ error: 'Payment intent creation failed' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const intent = await paymentService.retrievePaymentIntent(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }
    const { userId, candidateId } = intent.metadata;
    const amount = intent.amount / 100;
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        type: 'VOTE_PURCHASE',
        status: 'COMPLETED',
        stripePaymentIntentId: paymentIntentId,
        candidateId: candidateId || null,
      },
    });
    res.json({ payment });
  } catch (err) {
    console.error('confirmPayment error:', err);
    res.status(500).json({ error: 'Confirmation failed' });
  }
};

exports.processVotePayment = async (req, res) => {
  try {
    const { electionId, candidateId, quantity } = req.body;
    const userId = req.user.id;
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      select: { votePrice: true },
    });
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }
    const amount = election.votePrice * quantity;
    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        type: 'VOTE_PURCHASE',
        status: 'COMPLETED',
        candidateId,
      },
    });
    res.json({ paymentId: payment.id });
  } catch (err) {
    console.error('processVotePayment error:', err);
    res.status(500).json({ error: err.message || 'Payment processing failed' });
  }
};

exports.initiateKhaltiPayment = async (req, res) => {
  try {
    const { electionId, candidateId, quantity } = req.body;
    const userId = req.user.id;
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      select: { votePrice: true, title: true },
    });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    const amount = election.votePrice * quantity;
    const purchaseOrderId = `${electionId}_${Date.now()}`;
    const returnUrl = `${process.env.CLIENT_URL}/payment/callback`;
    const meta = Buffer.from(JSON.stringify({ userId, candidateId, electionId, quantity })).toString('base64');

    const khaltiRes = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      {
        return_url: returnUrl,
        website_url: process.env.CLIENT_URL,
        amount: amount * 100,
        purchase_order_id: purchaseOrderId,
        purchase_order_name: meta,
      },
      {
        headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` },
      }
    );

    res.json({ paymentUrl: khaltiRes.data.payment_url });
  } catch (err) {
    console.error('Khalti initiate error:', err);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};
exports.verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, transaction_id, status, electionId, candidateId, quantity } = req.body;
    if (!pidx || !status) {
      return res.status(400).json({ error: 'Missing pidx or status' });
    }
    if (status !== 'Completed') {
      return res.status(400).json({ error: 'Payment was not completed' });
    }
    const verifyRes = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
    );
    if (verifyRes.data.status !== 'Completed') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Use directly provided fields, fallback to metadata if needed
    let userId = req.user.id;
    let finalElectionId = electionId;
    let finalCandidateId = candidateId;
    let finalQuantity = quantity;

    if (!finalElectionId || !finalCandidateId || !finalQuantity) {
      try {
        const metaStr = verifyRes.data.purchase_order_name || '';
        const decoded = Buffer.from(metaStr, 'base64').toString('utf8');
        const meta = JSON.parse(decoded);
        finalElectionId = meta.electionId;
        finalCandidateId = meta.candidateId;
        finalQuantity = meta.quantity;
        userId = meta.userId;
      } catch (e) {
        return res.status(400).json({ error: 'Invalid payment metadata' });
      }
    }

    const election = await prisma.election.findUnique({
      where: { id: finalElectionId },
      select: { votePrice: true },
    });
    if (!election) return res.status(404).json({ error: 'Election not found' });

    const amount = election.votePrice * finalQuantity;

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        type: 'VOTE_PURCHASE',
        status: 'COMPLETED',
        stripePaymentIntentId: pidx,
        candidateId: finalCandidateId,
      },
    });

    res.json({ paymentId: payment.id });
  } catch (err) {
    console.error('Khalti verify error:', err);
    res.status(500).json({ error: 'Verification failed: ' + err.message });
  }
};