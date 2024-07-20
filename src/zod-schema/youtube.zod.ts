import { z } from "zod";

export const uploadToYoutubeSchema = z.object({
  videoId: z.string(),
  visibility: z.enum(["public", "private"]).default("private"),
});

export type UploadToYoutube = z.infer<typeof uploadToYoutubeSchema>;
