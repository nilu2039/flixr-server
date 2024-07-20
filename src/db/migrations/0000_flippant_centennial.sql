CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"role" text DEFAULT 'editor' NOT NULL,
	"google_id" varchar(256) NOT NULL,
	"google_access_token" varchar(256) NOT NULL,
	"google_refresh_token" varchar(256) NOT NULL,
	"google_expires_in" integer NOT NULL,
	"profile_url_image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videos" (
	"video_id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"s3_bucket_name" varchar(256) NOT NULL,
	"s3_object_key" varchar(256) NOT NULL,
	"content_type" varchar(256) NOT NULL,
	"file_size" bigint DEFAULT 0 NOT NULL,
	"admin_id" integer NOT NULL,
	"upload_status" text DEFAULT 'idle' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "videos_s3_object_key_unique" UNIQUE("s3_object_key")
);
