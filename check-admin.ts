import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.adminUser.findFirst();
  console.log("Admin user:", admin);
  await prisma.$disconnect();
}

main().catch(console.error);