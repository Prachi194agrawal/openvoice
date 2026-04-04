const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function keepAlive() {
  console.log(`[${new Date().toLocaleTimeString()}] Sending keep-alive ping to database...`);
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`[${new Date().toLocaleTimeString()}] Keep-alive ping successful.`);
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] Keep-alive ping failed:`, error.message);
  }
}

console.log('Neon Database Keep-Alive Script Started!');
console.log('This will prevent the database from spinning down during your development session.');
console.log('Pinging every 4 minutes (Neon sleep timeout is 5 mins). Press Ctrl+C to stop.');

// Ping immediately
keepAlive();

// Ping every 4 minutes (240,000 ms)
setInterval(keepAlive, 240000);
