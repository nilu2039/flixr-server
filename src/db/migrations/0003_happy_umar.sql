ALTER TABLE "videos" ADD CONSTRAINT "videos_s3_object_key_unique" UNIQUE("s3_object_key");