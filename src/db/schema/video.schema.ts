import { relations } from "drizzle-orm";
import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import users from "./user.schema";

const videos = pgTable("videos", {
  videoId: uuid("video_id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  s3BucketName: varchar("s3_bucket_name", { length: 256 }).notNull(),
  s3ObjectKey: varchar("s3_object_key", { length: 256 }).notNull().unique(),
  contentType: varchar("content_type", { length: 256 }).notNull(),
  fileName: varchar("file_name", { length: 256 }).notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull().default(0),
  adminId: integer("admin_id").notNull(),
  uploadStatus: text("upload_status", {
    enum: ["idle", "pending", "completed"],
  })
    .notNull()
    .default("idle"),
  // editorId: integer("editor_id"),
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
