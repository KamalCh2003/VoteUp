const { PrismaClient, Role, ElectionStatus } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const voterPassword = await bcrypt.hash('Voter@123', 12);

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

  console.log('Seed data inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });