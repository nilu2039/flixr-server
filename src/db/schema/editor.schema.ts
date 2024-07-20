import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import users from "./user.schema";
import videos from "./video.schema";

const editors = pgTable("editors", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 256 }).notNull().unique(),
  password: varchar("password", { length: 256 }).notNull(),
  name: varchar("name", { length: 256 }),
  role: varchar("role", { length: 256 }).notNull().default("editor"),
  adminId: integer("admin_id").notNull(),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export type EditorsInsertType = typeof editors.$inferInsert;
export type Editor = typeof editors.$inferSelect;

export const editorsRelations = relations(editors, ({ one, many }) => ({
  admin: one(users, {
    fields: [editors.adminId],
    references: [users.id],
  }),
  videos: many(videos),
}));

export default editors;
