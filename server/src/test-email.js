require('dotenv').config();
const emailService = require('./services/email.service');

(async () => {
  const sent = await emailService.sendEmail({
    to: 'habiltamang17@gmail.com',  // <- Change to YOUR email
    subject: 'Test Email - Resend',
    html: '<p>This is a test email sent via Resend! 🎉</p>',
  });
  console.log('Email sent:', sent);
})();