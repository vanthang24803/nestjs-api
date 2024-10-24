import { drizzle } from "drizzle-orm/node-postgres";
import { roles } from "../schema";
import { connection } from "./connection";

async function main() {
  const db = drizzle(connection);

  const existingRoles = await db.select().from(roles);

  if (existingRoles.length === 0) {
    await db.insert(roles).values({
      name: "ADMIN",
    });

    await db.insert(roles).values({
      name: "CUSTOMER",
    });

    await db.insert(roles).values({
      name: "MANAGER",
    });

    console.log("Seeded roles successfully");
  } else {
    console.log("Roles already exist, skipping seed.");
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Error seeding roles:", error);
  process.exit(1);
});
