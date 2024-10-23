import { relations, type InferSelectModel } from "drizzle-orm";
import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { tokens, TokenSchema } from "./token.schema";
import { userRoles, UserRoleSchema } from "./user-role.schema";

export const users = pgTable("users", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  password: text("password").notNull(),
  avatar: text("avatar").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const userRelations = relations(users, ({ many }) => ({
  tokens: many(tokens),
  roles: many(userRoles),
}));

export type UserSchema = InferSelectModel<typeof users> & {
  roles: UserRoleSchema[];
  tokens: TokenSchema[];
};
