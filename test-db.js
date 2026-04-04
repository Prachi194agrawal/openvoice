const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log("Checking DB...");
  const users = await prisma.user.findMany();
  console.log("Users:", users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
