ALTER TABLE "videos" RENAME COLUMN "uploaded_to_youtube" TO "youtube_upload_status";--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "youtube_upload_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "youtube_upload_status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "youtube_upload_status" DROP NOT NULL;