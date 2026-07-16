// test-email.js
require('dotenv').config();
const emailService = require('./services/email.service');

(async () => {
  const sent = await emailService.sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'Test Email',
    html: '<p>This is a test</p>',
  });
  console.log('Email sent:', sent);
})();