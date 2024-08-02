import { z } from "zod";

export const videoUploadPresignedBodySchema = z.object({
  videoContentType: z.string().min(1),
  thumbnailContentType: z.string().min(1).optional(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
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
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(5000).optional(),
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
