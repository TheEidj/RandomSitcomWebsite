import { PrismaClient } from "@prisma/client";
import { seedProducts } from "./seed/products.js";
import { seedUsers } from "./seed/users.js";

const prisma = new PrismaClient();

async function main() {
  await seedProducts(prisma);
  await seedUsers(prisma);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
