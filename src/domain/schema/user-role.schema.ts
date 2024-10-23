import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { roles } from "./role.schema";
import { InferSelectModel, relations } from "drizzle-orm";

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
  }),
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export type UserRoleSchema = InferSelectModel<typeof userRoles>;
