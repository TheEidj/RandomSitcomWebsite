import argon2 from "argon2";

export async function seedUsers(prisma) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment");
  }

  const adminPasswordHash = await argon2.hash(adminPassword, { type: argon2.argon2i });

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const customers = ["customer1@example.test", "customer2@example.test"];
  for (const email of customers) {
    const passwordHash = await argon2.hash("change-me", { type: argon2.argon2i });
    await prisma.user.upsert({
      where: { email },
      create: { email, passwordHash, role: "CUSTOMER" },
      update: {},
    });
  }
}
