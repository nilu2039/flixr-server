import { z } from "zod";

export const videoUploadPresignedBodySchema = z.object({
  contentType: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const videoUploadStatusUpdateSchema = z.object({
  objectKey: z.string().optional(),
  videoId: z.string().optional(),
  status: z.enum(["pending", "failed"]).optional(),
});

export const videoStatusSchema = z.object({
  status: z.enum(["draft", "accepted", "rejected"]),
  videoId: z.string().min(1),
});

export const getAllVideosQuerySchema = z.object({
  editorId: z.string().optional().nullable(),
});

export const getVideoDetailsQuerySchema = z.object({
  videoId: z.string().min(1),
});

export const editVideoDetailsSchema = z.object({
  videoId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export type VideoStatus = z.infer<typeof videoStatusSchema>;

export type VideoUploadPresignedUrl = z.infer<
  typeof videoUploadPresignedBodySchema
>;

export type VideoUploadStatusUpdate = z.infer<
  typeof videoUploadStatusUpdateSchema
>;

export type GetAllVideosQuery = z.infer<typeof getAllVideosQuerySchema>;

export type GetVideoDetailsQuery = z.infer<typeof getVideoDetailsQuerySchema>;

export type EditVideoDetails = z.infer<typeof editVideoDetailsSchema>;
