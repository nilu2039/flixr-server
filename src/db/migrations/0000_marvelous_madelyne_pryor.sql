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
