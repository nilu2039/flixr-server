CREATE TABLE IF NOT EXISTS "videos" (
	"video_id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"s3_bucket_name" varchar(256) NOT NULL,
	"s3_object_key" varchar(256) NOT NULL,
	"content_type" varchar(256) NOT NULL,
	"file_size" text,
	"admin_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
