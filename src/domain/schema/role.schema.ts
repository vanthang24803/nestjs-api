import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";
import { userRoles } from "./user-role.schema";

export const roleEnum = pgEnum("role", ["CUSTOMER", "MANAGER", "ADMIN"]);

export const roles = pgTable("roles", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  name: text("name").default("MANAGER"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const roleRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export type RoleSchema = InferSelectModel<typeof roles>;
