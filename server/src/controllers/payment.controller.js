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

    // 1. Basic validation
    if (!pidx || !status) {
      return res.status(400).json({ error: 'Missing pidx or status' });
    }
    if (status !== 'Completed') {
      return res.status(400).json({ error: 'Payment was not completed' });
    }

    // 2. Verify with Khalti
    let verifyRes;
    try {
      verifyRes = await axios.post(
        'https://dev.khalti.com/api/v2/epayment/lookup/',
        { pidx },
        { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
      );
    } catch (apiErr) {
      console.error('Khalti lookup failed:', apiErr.response?.data || apiErr.message);
      return res.status(400).json({ error: 'Payment lookup failed. Please try again.' });
    }

    if (verifyRes.data.status !== 'Completed') {
      return res.status(400).json({ error: 'Payment verification failed – status is ' + verifyRes.data.status });
    }

    // 3. Extract metadata – prefer frontend fields, fallback to purchase_order_name
    let userId = req.user?.id;            // may be undefined if token expired
    let finalElectionId = electionId;
    let finalCandidateId = candidateId;
    let finalQuantity = quantity;

    if (!finalElectionId || !finalCandidateId || !finalQuantity || !userId) {
      try {
        const metaStr = verifyRes.data.purchase_order_name || '';
        if (!metaStr) throw new Error('No metadata found in payment');
        const decoded = Buffer.from(metaStr, 'base64').toString('utf8');
        const meta = JSON.parse(decoded);
        finalElectionId = finalElectionId || meta.electionId;
        finalCandidateId = finalCandidateId || meta.candidateId;
        finalQuantity = finalQuantity || meta.quantity;
        userId = userId || meta.userId;
      } catch (e) {
        console.error('Metadata decode error:', e.message);
        return res.status(400).json({ error: 'Invalid payment metadata – please try again' });
      }
    }

    if (!finalElectionId || !finalCandidateId || !finalQuantity || !userId) {
      return res.status(400).json({ error: 'Incomplete election information – please restart the voting process' });
    }

    // 4. Validate election
    const election = await prisma.election.findUnique({
      where: { id: finalElectionId },
      select: { votePrice: true, status: true },
    });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (election.status !== 'ACTIVE') return res.status(400).json({ error: 'Election is not active' });

    const amount = election.votePrice * finalQuantity;

    // 5. Atomically create payment and vote
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId,
          amount,
          type: 'VOTE_PURCHASE',
          status: 'COMPLETED',
          stripePaymentIntentId: pidx,
          candidateId: finalCandidateId,
        },
      });

      let vote = null;
      let voteError = null;
      try {
        const existingVote = await tx.vote.findFirst({
          where: { userId, electionId: finalElectionId },
        });
        if (existingVote) {
          voteError = 'You have already voted in this election.';
        } else {
          vote = await tx.vote.create({
            data: {
              userId,
              electionId: finalElectionId,
              candidateId: finalCandidateId,
              quantity: finalQuantity,
              paymentId: payment.id,
              txHash: pidx,
            },
          });
          await tx.candidate.update({
            where: { id: finalCandidateId },
            data: { votesReceived: { increment: finalQuantity } },
          });
          await tx.election.update({
            where: { id: finalElectionId },
            data: { totalVotes: { increment: finalQuantity } },
          });
        }
      } catch (err) {
        console.error('Vote creation error:', err);
        voteError = err.message || 'Failed to record vote';
      }
      return { payment, vote, voteError };
    });

    res.json({
      paymentId: result.payment.id,
      voteCasted: !!result.vote,
      voteError: result.voteError || null,
    });
  } catch (err) {
    console.error('Khalti verify error:', err);
    res.status(500).json({ error: 'Verification failed: ' + err.message });
  }
};