import { z } from "zod";

export const videoUploadPresignedBodySchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  title: z.string(),
  description: z.string(),
});

export type VideoUploadPresignedUrl = z.infer<
  typeof videoUploadPresignedBodySchema
>;

export const VideoUploadStatusUpdateSchema = z.object({
  objectKey: z.string(),
  fileSize: z.number(),
});

export type VideoUploadStatusUpdate = z.infer<
  typeof VideoUploadStatusUpdateSchema
>;
