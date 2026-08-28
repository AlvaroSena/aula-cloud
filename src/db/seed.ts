import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import { db } from ".";
import { barbershops, users } from "./schema";

const USERS_COUNT = 10;

async function seed() {
  console.log("🌱 Starting seed...");

  const password = await bcrypt.hash("password123", 10);

  const createdUsers = await db
    .insert(users)
    .values(
      Array.from({ length: USERS_COUNT }, () => ({
        email: faker.internet.email().toLowerCase(),
        password,
      })),
    )
    .returning({
      id: users.id,
    });

  await db.insert(barbershops).values(
    createdUsers.map(({ id }) => ({
      name: faker.company.name(),
      userId: id,
    })),
  );

  console.log(`✅ Created ${createdUsers.length} users`);
  console.log(`✅ Created ${createdUsers.length} barbershops`);
  console.log("🌱 Seed completed!");

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
