// src/services/email.service.js
const SibApiV3Sdk = require('@sendinblue/client');

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Set API key
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("Attempting to send email via Brevo...");
    console.log("To:", to);
    console.log("Subject:", subject);

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = {
      name: "VoteUp",
      email: process.env.BREVO_FROM_EMAIL || 'kamalchy110@gmail.com'
    };
    sendSmtpEmail.to = [{ email: to }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log("Email sent successfully!");
    console.log("Message ID:", data.messageId);
    return true;
  } catch (err) {
    console.error("Email send error:");
    console.error(err);
    return false;
  }
};

// Email wrapper (same as before)
const emailWrapper = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VoteUp</title>
    <style>
      body { margin: 0; padding: 0; background-color: #f4f7fb; font-family: 'Segoe UI', Arial, sans-serif; }
      .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 35px -10px rgba(0,0,0,0.1); border: 1px solid #f9fafb; }
      .header { background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px; }
      .header p { margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
      .content { padding: 32px 28px; color: #1f2937; line-height: 1.5; }
      .otp-code { font-size: 36px; letter-spacing: 12px; font-weight: 800; background: #f3f4f6; display: inline-block; padding: 12px 24px; border-radius: 16px; font-family: monospace; margin: 16px 0; color: #1f2937; }
      .button { display: inline-block; background: #6d28d9; color: white; text-decoration: none; padding: 12px 28px; border-radius: 40px; font-weight: 600; margin: 16px 0 8px; box-shadow: 0 4px 8px rgba(109,40,217,0.2); }
      .footer { background: #f9fafb; padding: 20px 28px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
      .footer a { color: #6d28d9; text-decoration: none; }
      @media only screen and (max-width: 600px) { .content { padding: 24px 20px; } .otp-code { font-size: 28px; letter-spacing: 8px; } }
    </style>
  </head>
  <body style="margin:0; padding:20px 16px; background:#f4f7fb;">
    <div class="container">
      <div class="header"><h1>VoteUp</h1><p>Secure digital voting platform</p></div>
      <div class="content">${content}</div>
      <div class="footer"><p>© ${new Date().getFullYear()} VoteUp. All rights reserved.<br>Need help? <a href="${process.env.CLIENT_URL}/support">Contact support</a></p></div>
    </div>
  </body>
  </html>
`;

const sendVerificationOtp = async (email, otp) => {
  console.log("📨 sendVerificationOtp called for:", email);
  const content = `
    <h2 style="margin-top:0; color:#111827;">Verify your email address</h2>
    <p style="color:#4b5563;">Thanks for joining VoteUp! Please use the verification code below to complete your registration.</p>
    <div style="text-align:center;"><div class="otp-code">${otp}</div></div>
    <p style="color:#4b5563; font-size:14px;">This code is valid for <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
  `;
  const html = emailWrapper(content);
  return await sendEmail({ to: email, subject: "Verify your email – VoteUp", html });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  const content = `
    <h2 style="margin-top:0; color:#111827;">Reset your password</h2>
    <p style="color:#4b5563;">We received a request to reset your VoteUp account password. Click the button below to create a new password.</p>
    <div style="text-align:center; margin:24px 0;"><a href="${resetUrl}" class="button">Reset Password</a></div>
    <p style="color:#4b5563; font-size:14px;">If you didn't ask to reset your password, you can safely ignore this email. The link will expire in 15 minutes.</p>
    <hr style="margin:24px 0; border:none; border-top:1px solid #e5e7eb;" />
    <p style="color:#6b7280; font-size:12px;">If the button doesn't work, copy and paste this link:<br /><a href="${resetUrl}" style="color:#6d28d9; word-break:break-all;">${resetUrl}</a></p>
  `;
  const html = emailWrapper(content);
  return await sendEmail({ to: email, subject: 'Reset your password – VoteUp', html });
};

const sendWelcomePassword = async (email, firstName, lastName, tempPassword) => {
  const content = `
    <h2 style="margin-top:0; color:#111827;">Welcome to VoteUp, ${firstName} ${lastName}!</h2>
    <p>An administrator has registered you as a candidate. You can now log in using the following credentials:</p>
    <div style="background:#f3f4f6; padding:16px; border-radius:12px; margin:20px 0;">
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary password:</strong> ${tempPassword}</p>
    </div>
    <p style="color:#4b5563;">Please log in and change your password immediately.</p>
    <a href="${process.env.CLIENT_URL}/login" class="button">Login to VoteUp</a>
  `;
  const html = emailWrapper(content);
  return await sendEmail({ to: email, subject: 'Your candidate account has been created', html });
};

module.exports = { sendEmail, sendVerificationOtp, sendPasswordResetEmail, sendWelcomePassword };