import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import users from "./user.schema";

const videos = pgTable("videos", {
  videoId: uuid("video_id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  s3BucketName: varchar("s3_bucket_name", { length: 256 }).notNull(),
  s3ObjectKey: varchar("s3_object_key", { length: 256 }).notNull(),
  contentType: varchar("content_type", { length: 256 }).notNull(),
  fileSize: text("file_size"),
  adminId: integer("admin_id").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const videosRelations = relations(videos, ({ one }) => ({
  admin: one(users, {
    fields: [videos.adminId],
    references: [users.id],
  }),
}));

export type VideosInsertType = typeof videos.$inferInsert;
export type Video = typeof videos.$inferSelect;

export default videos;
