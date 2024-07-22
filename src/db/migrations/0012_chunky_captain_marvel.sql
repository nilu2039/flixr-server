ALTER TABLE "videos" ALTER COLUMN "youtube_upload_status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "youtube_upload_status" SET NOT NULL;