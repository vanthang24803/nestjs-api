import { drizzle } from "drizzle-orm/node-postgres";
import { roles } from "../schema";
import { rolesToInsert } from "./role.seed";
import { connection } from "./connection";

async function main() {
  const db = drizzle(connection);

  const existingRoles = await db.select().from(roles);

  if (existingRoles.length === 0) {
    await db.insert(roles).values(rolesToInsert);
    console.log("Seeded roles successfully");
  } else {
    console.log("Roles already exist, skipping seed.");
  }

  process.exit(1);
}

main();
