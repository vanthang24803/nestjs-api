import { relations, type InferSelectModel } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const tokenEnum = pgEnum("type", [
  "REFRESH_TOKEN",
  "FORGOT_PASSWORD_TOKEN",
  "VERIFY_ACCOUNT_TOKEN",
]);

export const tokens = pgTable("tokens", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  type: tokenEnum("type").notNull(),
  value: text("value").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const tokenRelations = relations(tokens, ({ one }) => ({
  user: one(users, {
    fields: [tokens.userId],
    references: [users.id],
  }),
}));

export type TokenSchema = InferSelectModel<typeof tokens>;
