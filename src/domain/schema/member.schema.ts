import { InferInsertModel, relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { projects } from "./project.schema";
export const memberRole = pgEnum("member_role", [
  "Administrator",
  "Member",
  "Viewer",
]);

export const members = pgTable(
  "members",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id)
      .notNull(),

    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id)
      .notNull(),

    role: memberRole("role").notNull().default("Member"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updateAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.projectId] }),
    uniqueUserId: uniqueIndex("unique_user_id").on(t.userId),
  }),
);

export const memberRelations = relations(members, ({ one }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [members.projectId],
    references: [projects.id],
  }),
}));

export type MemberSchema = InferInsertModel<typeof members>;
