import { InferSelectModel, relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { members, MemberSchema } from "./member.schema";

export const projectType = pgEnum("project_type", [
  "Software",
  "Marketing",
  "Business",
]);

export const projects = pgTable("projects", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull().unique(),
  type: projectType("type").notNull().default("Software"),
  description: text("description"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const projectRelations = relations(projects, ({ many }) => ({
  members: many(members),
}));

export type ProjectSchema = InferSelectModel<typeof projects> & {
  members: MemberSchema[];
};
