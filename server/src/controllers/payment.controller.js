// controllers/payment.controller.js
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

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const amount = election.votePrice * quantity;
    const purchaseOrderId = `${electionId}_${Date.now()}`;
    const returnUrl = `${process.env.CLIENT_URL}/payment/callback`;

    const khaltiRes = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      {
        return_url: returnUrl,
        website_url: process.env.CLIENT_URL,
        amount: amount * 100,
        purchase_order_id: purchaseOrderId,
        purchase_order_name: 'Vote payment',
      },
      {
        headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` },
      }
    );

    // Store the payment intent locally
    await prisma.paymentIntent.create({
      data: {
        userId,
        pidx: khaltiRes.data.pidx,
        electionId,
        candidateId,
        quantity,
        amount,
        status: 'PENDING',
      },
    });

    res.json({ paymentUrl: khaltiRes.data.payment_url });
  } catch (err) {
    console.error('Khalti initiate error:', err);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

exports.verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, transaction_id, status, electionId, candidateId, quantity } = req.body;
    console.log('verifyKhaltiPayment called:', { pidx, transaction_id, status, electionId, candidateId, quantity });

    if (!pidx || !status) {
      return res.status(400).json({ error: 'Missing pidx or status' });
    }
    if (status !== 'Completed') {
      return res.status(400).json({ error: 'Payment was not completed' });
    }

    let verifyRes;
    try {
      verifyRes = await axios.post(
        'https://dev.khalti.com/api/v2/epayment/lookup/',
        { pidx },
        { headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` } }
      );
      console.log('Khalti lookup response:', verifyRes.data);
    } catch (apiErr) {
      console.error('Khalti lookup failed:', apiErr.response?.data || apiErr.message);
      return res.status(400).json({ error: 'Payment lookup failed. Please try again.' });
    }

    if (verifyRes.data.status !== 'Completed') {
      return res.status(400).json({ error: 'Payment verification failed – status is ' + verifyRes.data.status });
    }

    const paymentIntent = await prisma.paymentIntent.findUnique({
      where: { pidx },
    });
    if (!paymentIntent) {
      console.error('No payment intent found for pidx:', pidx);
      return res.status(404).json({ error: 'Payment intent not found. Please try again.' });
    }

    if (paymentIntent.status === 'COMPLETED') {
      return res.json({ voteCasted: false, voteError: 'Payment already processed' });
    }

    const userId = paymentIntent.userId;
    const finalElectionId = paymentIntent.electionId;
    const finalCandidateId = paymentIntent.candidateId;
    const finalQuantity = paymentIntent.quantity;

    console.log(`Final data: userId=${userId}, electionId=${finalElectionId}, candidateId=${finalCandidateId}, quantity=${finalQuantity}`);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error('User not found:', userId);
      return res.status(400).json({ error: 'User not found. Please login again.' });
    }

    const election = await prisma.election.findUnique({
      where: { id: finalElectionId },
      select: { votePrice: true, status: true },
    });
    if (!election) {
      console.error('Election not found:', finalElectionId);
      return res.status(404).json({ error: 'Election not found' });
    }
    if (election.status !== 'ACTIVE') {
      console.error('Election not active:', election.status);
      return res.status(400).json({ error: 'Election is not active' });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: finalCandidateId },
    });
    if (!candidate) {
      console.error('Candidate not found:', finalCandidateId);
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const amount = election.votePrice * finalQuantity;

    const result = await prisma.$transaction(async (tx) => {
      await tx.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: { status: 'COMPLETED', transactionId: transaction_id },
      });

      const existingPayment = await tx.payment.findFirst({
        where: { stripePaymentIntentId: pidx, status: 'COMPLETED' },
      });
      if (existingPayment) {
        console.log('Duplicate payment detected:', pidx);
        return { payment: existingPayment, vote: null, voteError: 'Payment already processed' };
      }

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
      console.log('Payment created:', payment.id);

      let vote = null;
      let voteError = null;

      if (election.votePrice === 0) {
        const existingVote = await tx.vote.findFirst({
          where: { userId, electionId: finalElectionId },
        });
        if (existingVote) {
          console.log('User already voted in free election:', userId, finalElectionId);
          voteError = 'You have already voted in this free election.';
          return { payment, vote: null, voteError };
        }
      }

      // For paid elections, allow unlimited votes
      try {
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
        console.log('Vote created:', vote.id);

        await tx.candidate.update({
          where: { id: finalCandidateId },
          data: { votesReceived: { increment: finalQuantity } },
        });
        console.log('Candidate votes updated');

        await tx.election.update({
          where: { id: finalElectionId },
          data: { totalVotes: { increment: finalQuantity } },
        });
        console.log('Election total votes updated');
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