CREATE TABLE IF NOT EXISTS "editors" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(256) NOT NULL,
	"password" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"role" varchar(256) DEFAULT 'editor' NOT NULL,
	"admin_id" serial NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "editors_username_unique" UNIQUE("username")
);
