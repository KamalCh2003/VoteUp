const { PrismaClient, Role, ElectionStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const voterPassword = await bcrypt.hash('Voter@123', 12);

  // Upsert admin user
  await prisma.user.upsert({
    where: { email: 'admin@votechain.com' },
    update: {},
    create: {
      email: 'admin@votechain.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      nationalId: 'ADMIN-001',
      role: Role.ADMIN,
      isVerified: true,
      wallet: { create: { balance: 0 } },
    },
  });

  // Upsert test voter
  await prisma.user.upsert({
    where: { email: 'voter@example.com' },
    update: {},
    create: {
      email: 'voter@example.com',
      passwordHash: voterPassword,
      firstName: 'John',
      lastName: 'Doe',
      nationalId: 'VT-2024-8821',
      role: Role.VOTER,
      isVerified: true,
      wallet: { create: { balance: 100 } },
    },
  });

  // Upsert default system settings (only if missing)
  const defaultSettings = [
    { key: 'siteName', value: 'VoteChain' },
    { key: 'siteDescription', value: 'Secure online voting platform' },
    { key: 'defaultLanguage', value: 'en' },
    { key: 'timezone', value: 'Asia/Kathmandu' },
    { key: 'maintenanceMode', value: false },
    { key: 'twoFactorRequired', value: false },
    { key: 'maxLoginAttempts', value: 5 },
    { key: 'sessionTimeout', value: 30 },
    { key: 'passwordMinLength', value: 8 },
    { key: 'requireEmailVerification', value: true },
    { key: 'candidacyFee', value: 5000 },
    { key: 'premiumVoterFee', value: 1500 },
    { key: 'currency', value: 'NPR' },
    { key: 'enablePayments', value: true },
    { key: 'paymentGateway', value: 'esewa' },
    { key: 'smtpHost', value: 'smtp.sendgrid.net' },
    { key: 'smtpPort', value: 587 },
    { key: 'smtpUser', value: '' },
    { key: 'smtpPass', value: '' },
    { key: 'fromEmail', value: 'noreply@votechain.com' },
    { key: 'notifyNewElection', value: true },
    { key: 'notifyVoteConfirmed', value: true },
    { key: 'notifyCandidateApplied', value: true },
    { key: 'notifyPaymentReceived', value: true },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Seed data inserted (users + system settings)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });