import { ReadStream } from "fs";
import { google, youtube_v3 } from "googleapis";
import logger from "../lib/logger";
import { updateVideoUploadStatus } from "../utils/video";

const youtube = google.youtube("v3");

export const uploadVideo = async (
  auth: Express.User,
  videoDetails: {
    title: string;
    description: string;
    tags: string[];
    categoryId: string;
    privacyStatus: string;
    mediaStream: ReadStream;
  },
  uploadVideoId: string
): Promise<youtube_v3.Schema$Video | null> => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: auth.accessToken,
    refresh_token: auth.refreshToken,
    expiry_date: auth.expiresIn,
  });
  try {
    logger.info("Uploading video");
    updateVideoUploadStatus(uploadVideoId, "uploading");
    const res = await youtube.videos.insert({
      auth: oauth2Client,
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: videoDetails.title,
          description: videoDetails.description,
          tags: videoDetails.tags,
          categoryId: videoDetails.categoryId,
        },
        status: {
          privacyStatus: videoDetails.privacyStatus ?? "private",
        },
      },
      media: {
        body: videoDetails.mediaStream,
      },
    });
    logger.info("Video uploaded", res.data.id);
    updateVideoUploadStatus(uploadVideoId, "completed");
    return res.data;
  } catch (error) {
    logger.error("Error uploading video", error);
    updateVideoUploadStatus(uploadVideoId, "failed");
    return null;
  }
};
