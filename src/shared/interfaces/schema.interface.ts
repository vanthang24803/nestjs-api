import * as schema from "@/domain/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export interface Schema extends NodePgDatabase<typeof schema> {}
