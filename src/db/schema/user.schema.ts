import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import videos from "./video.schema";

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 256 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  role: text("role", { enum: ["admin", "editor"] })
    .notNull()
    .default("editor"),
  googleId: varchar("google_id", { length: 256 }).notNull().unique(),
  googleAccessToken: varchar("google_access_token", { length: 256 }).notNull(),
  googleRefreshToken: varchar("google_refresh_token", {
    length: 256,
  }).notNull(),
  googleExpiresIn: integer("google_expires_in").notNull(),
  profileUrlImage: text("profile_url_image"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export type UsersInsertType = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export default users;
