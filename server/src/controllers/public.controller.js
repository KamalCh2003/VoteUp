const prisma = require('../config/database');
const emailService = require('../services/email.service');

exports.requestElection = async (req, res) => {
  try {
    const { name, email, phone, organization, message } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;

    // Save to DB
    const request = await prisma.electionRequest.create({
      data: {
        name,
        email,
        phone,
        organization,
        message,
      },
    });

    // Try to send email (non‑blocking)
    if (adminEmail) {
      const htmlContent = `
        <h3>New Election Request</h3>
        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Organization:</strong> ${organization || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `;
      emailService.sendEmail({
        to: adminEmail,
        subject: 'New Election Request from VoteUp',
        html: htmlContent,
      }).catch(err => console.error('Email failed:', err));
    }

    res.json({ success: true, message: 'Request submitted successfully' });
  } catch (err) {
    console.error('Election request error:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
};

exports.getPublicStats = async (req, res) => {
  try {
    const [activeElections, totalVotes] = await Promise.all([
      prisma.election.count({ where: { status: 'ACTIVE' } }),
      prisma.vote.aggregate({ _sum: { quantity: true } }),
    ]);
    res.json({
      activeElections,
      totalVotes: totalVotes._sum.quantity || 0,
    });
  } catch (err) {
    console.error('Public stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
};