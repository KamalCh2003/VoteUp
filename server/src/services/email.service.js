const getTransporter = () => {
  if (transporter) return transporter;

  console.log("===== EMAIL CONFIG =====");
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
  console.log("CLIENT_URL:", process.env.CLIENT_URL);
  console.log("========================");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Email credentials missing. OTP will be shown in console.");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("❌ Transporter not created.");
    return false;
  }

  try {
    console.log("📧 Attempting to send email...");
    console.log("To:", to);
    console.log("Subject:", subject);

    const info = await transporter.sendMail({
      from: `"VoteUp" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully!");
    console.log(info);

    return true;
  } catch (err) {
    console.error("❌ Email send error:");
    console.error(err);
    return false;
  }
};

// Professional email wrapper
const emailWrapper = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VoteUp</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f7fb;
        font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      }
      .container {
        max-width: 560px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.1);
        border: 1px solid #f9fafb; /* gray-50 border */
      }
      .header {
        background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%);
        padding: 32px 24px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: white;
        letter-spacing: -0.5px;
      }
      .header p {
        margin: 8px 0 0;
        color: rgba(255,255,255,0.85);
        font-size: 14px;
      }
      .content {
        padding: 32px 28px;
        color: #1f2937;
        line-height: 1.5;
      }
      .otp-code {
        font-size: 36px;
        letter-spacing: 12px;
        font-weight: 800;
        background: #f3f4f6;
        display: inline-block;
        padding: 12px 24px;
        border-radius: 16px;
        font-family: monospace;
        margin: 16px 0;
        color: #1f2937;
      }
      .button {
        display: inline-block;
        background: #6d28d9;
        color: white;
        text-decoration: none;
        padding: 12px 28px;
        border-radius: 40px;
        font-weight: 600;
        margin: 16px 0 8px;
        box-shadow: 0 4px 8px rgba(109,40,217,0.2);
      }
      .footer {
        background: #f9fafb;
        padding: 20px 28px;
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        border-top: 1px solid #e5e7eb;
      }
      .footer a {
        color: #6d28d9;
        text-decoration: none;
      }
      @media only screen and (max-width: 600px) {
        .content { padding: 24px 20px; }
        .otp-code { font-size: 28px; letter-spacing: 8px; }
      }
    </style>
  </head>
  <body style="margin:0; padding:20px 16px; background:#f4f7fb;">
    <div class="container">
      <div class="header">
        <h1>VoteUp</h1>
        <p>Secure digital voting platform</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} VoteUp. All rights reserved.<br>
        Need help? <a href="${process.env.CLIENT_URL}/support">Contact support</a></p>
      </div>
    </div>
  </body>
  </html>
`;

const sendVerificationOtp = async (email, otp) => {
  console.log("📨 sendVerificationOtp called for:", email);

  const content = `
    <h2 style="margin-top:0; color:#111827;">Verify your email address</h2>
    <p style="color:#4b5563;">Thanks for joining VoteUp! Please use the verification code below to complete your registration.</p>
    <div style="text-align:center;">
      <div class="otp-code">${otp}</div>
    </div>
    <p style="color:#4b5563; font-size:14px;">This code is valid for <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
  `;

  const html = emailWrapper(content);
  const sent = await sendEmail({
    to: email,
    subject: "Verify your email – VoteUp",
    html,
  });

  if (!sent) {
    console.log(`📧 [DEV] OTP for ${email}: ${otp}`);
    return { devOtp: otp };
  }

  return { sent: true };
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  // This email uses a separate inline template, so we add the same border style directly
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f9fafb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%); padding: 32px 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: white;">VoteUp</h1>
        <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Secure digital voting platform</p>
      </div>
      <!-- Content -->
      <div style="padding: 32px 28px;">
        <h2 style="margin-top: 0; color: #111827;">Reset your password</h2>
        <p style="color: #4b5563; line-height: 1.5;">We received a request to reset your VoteUp account password. Click the button below to create a new password.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #6d28d9; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 40px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Reset Password</a>
        </div>
        <p style="color: #4b5563; font-size: 14px;">If you didn't ask to reset your password, you can safely ignore this email. The link will expire in 15 minutes.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br />
        <a href="${resetUrl}" style="color: #6d28d9; word-break: break-all;">${resetUrl}</a></p>
      </div>
      <!-- Footer -->
      <div style="background: #f9fafb; padding: 20px 28px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">© ${new Date().getFullYear()} VoteUp. All rights reserved.<br />Need help? <a href="${process.env.CLIENT_URL}/support" style="color: #6d28d9; text-decoration: none;">Contact support</a></p>
      </div>
    </div>
  `;
  await sendEmail({ to: email, subject: 'Reset your password – VoteUp', html });
};

// Welcome password email – also with border
const sendWelcomePassword = async (email, firstName, lastName, tempPassword) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #f9fafb;">
      <h2 style="color: #6d28d9;">Welcome to VoteUp, ${firstName} ${lastName}!</h2>
      <p>An administrator has registered you as a candidate. You can now log in using the following credentials:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary password:</strong> ${tempPassword}</p>
      </div>
      <p style="color: #4b5563;">Please log in and change your password immediately.</p>
      <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; background: #6d28d9; color: white; padding: 10px 20px; border-radius: 40px; text-decoration: none; margin-top: 10px;">Login to VoteUp</a>
      <hr />
      <p style="font-size: 12px; color: #6b7280;">If you didn't expect this email, please ignore it.</p>
    </div>
  `;
  await sendEmail({ to: email, subject: 'Your candidate account has been created', html });
};

module.exports = { sendEmail, sendVerificationOtp, sendPasswordResetEmail, sendWelcomePassword };