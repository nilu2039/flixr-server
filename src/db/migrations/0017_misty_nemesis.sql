ALTER TABLE "editors" ADD COLUMN "email" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "editors" ADD CONSTRAINT "editors_email_unique" UNIQUE("email");