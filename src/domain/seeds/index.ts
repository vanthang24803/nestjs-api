import { drizzle } from "drizzle-orm/node-postgres";
import { connection } from "./connection";

async function main() {
  const db = drizzle(connection);

  console.log(db);

  process.exit(0);
}

main().catch((error) => {
  console.error("Error seeding roles:", error);
  process.exit(1);
});
