const app = require('./app');
const config = require('./config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function startServer() {
  try {
    // Test the database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');

    // Start the server only after DB is confirmed
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    console.error('Make sure your NeonDB project is active and IP is allowed.');
    process.exit(1);
  }
}

startServer();