import { z } from "zod";

export const videoUploadPresignedUrlSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
});

export type VideoUploadPresignedUrl = z.infer<
  typeof videoUploadPresignedUrlSchema
>;
