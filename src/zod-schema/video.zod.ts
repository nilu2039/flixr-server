import { z } from "zod";

export const videoUploadPresignedBodySchema = z.object({
  contentType: z.string(),
  title: z.string(),
  description: z.string(),
});

export type VideoUploadPresignedUrl = z.infer<
  typeof videoUploadPresignedBodySchema
>;

export const videoUploadStatusUpdateSchema = z.object({
  objectKey: z.string(),
  fileSize: z.number(),
});

export type VideoUploadStatusUpdate = z.infer<
  typeof videoUploadStatusUpdateSchema
>;

export const videoStatusSchema = z.object({
  status: z.enum(["draft", "accepted", "rejected"]),
  videoId: z.string(),
});

export type VideoStatus = z.infer<typeof videoStatusSchema>;
