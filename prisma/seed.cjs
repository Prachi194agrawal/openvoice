const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "123@iiitm.ac.in";

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      isBlocked: false,
      name: "Admin",
    },
    create: {
      email,
      name: "Admin",
      role: "ADMIN",
      isBlocked: false,
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
