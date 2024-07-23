import { z } from "zod";

export const videoUploadPresignedBodySchema = z.object({
  contentType: z.string(),
  title: z.string(),
  description: z.string(),
});

export const videoUploadStatusUpdateSchema = z.object({
  objectKey: z.string().optional(),
  videoId: z.string().optional(),
  failed: z.boolean().optional(),
});

export const videoStatusSchema = z.object({
  status: z.enum(["draft", "accepted", "rejected"]),
  videoId: z.string(),
});

export const getAllVideosQuerySchema = z.object({
  editorId: z.string().optional().nullable(),
});

export type VideoStatus = z.infer<typeof videoStatusSchema>;

export type VideoUploadPresignedUrl = z.infer<
  typeof videoUploadPresignedBodySchema
>;

export type VideoUploadStatusUpdate = z.infer<
  typeof videoUploadStatusUpdateSchema
>;

export type GetAllVideosQuery = z.infer<typeof getAllVideosQuerySchema>;
