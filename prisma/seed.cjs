const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "123@iiitm.ac.in";
  const plainPassword = "123456";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      isBlocked: false,
      hashedPassword,
      name: "Admin",
    },
    create: {
      email,
      name: "Admin",
      role: "ADMIN",
      isBlocked: false,
      hashedPassword,
    },
  });

  console.log("Admin ready:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
