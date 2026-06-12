// services/email.service.js
const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Email credentials missing. OTP will be shown in console.");
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: `"VoteUp" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
};

const sendVerificationOtp = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color: #6d28d9;">Verify your email</h2>
      <p>Use this code to complete your registration:</p>
      <div style="font-size: 32px; letter-spacing: 6px; background: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px;">
        ${otp}
      </div>
      <p style="color: #6b7280; margin-top: 20px;">Code expires in 10 minutes.</p>
      <hr />
      <p style="font-size: 12px;">VoteUp – Secure Online Voting</p>
    </div>`;

  const sent = await sendEmail({ to: email, subject: 'Your verification code', html });
  if (!sent) {
    console.log(`📧 [DEV] OTP for ${email}: ${otp}`);
    return { devOtp: otp };
  }
  return { sent: true };
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  const html = `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 15 minutes.</p>`;
  await sendEmail({ to: email, subject: 'Reset your password', html });
};

module.exports = { sendEmail, sendVerificationOtp, sendPasswordResetEmail };