import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
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
  googleExpiresIn: varchar("google_expires_in", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});
