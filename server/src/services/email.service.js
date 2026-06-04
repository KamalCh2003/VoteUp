const getTransporter = require('../config/email');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`Email not sent (no transporter): ${subject} to ${to}`);
    return false;
  }
  await transporter.sendMail({
    from: process.env.SMTP_USER || 'noreply@votechain.com',
    to,
    subject,
    html,
  });
  return true;
};

const sendVerificationOtp = async (email, otp) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
      <h2 style="color: #7c6fff;">VoteChain</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing: 8px; background: #f3f0ff; padding: 16px; border-radius: 8px; text-align: center;">${otp}</h1>
      <p style="color: #666;">This code expires in 10 minutes.</p>
    </div>`;

  const sent = await sendEmail({
    to: email,
    subject: 'Your VoteChain Verification Code',
    html,
  });

  if (!sent) {
    // Fallback for development – return OTP so controller can pass it to client
    console.log(`🔐 DEV OTP for ${email}: ${otp}`);
    return { devOtp: otp };
  }
  return { sent: true };
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  const html = `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 15 minutes.</p>`;
  await sendEmail({
    to: email,
    subject: 'Reset your VoteChain password',
    html,
  });
};

module.exports = { sendEmail, sendVerificationOtp, sendPasswordResetEmail };