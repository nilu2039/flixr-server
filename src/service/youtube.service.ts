import { ReadStream } from "fs";
import { google, youtube_v3 } from "googleapis";
import logger from "../lib/logger";
import { updateVideoUploadYoutubeStatus } from "../utils/video";

const youtube = google.youtube("v3");

export const uploadVideoToYoutube = async (
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
    access_token: auth.googleAccessToken,
    refresh_token: auth.googleRefreshToken,
    expiry_date: auth.googleExpiresIn,
  });
  try {
    logger.info("Uploading video");
    updateVideoUploadYoutubeStatus(uploadVideoId, "uploading");
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
    updateVideoUploadYoutubeStatus(uploadVideoId, "completed");
    return res.data;
  } catch (error) {
    logger.error("Error uploading video", error);
    updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
    return null;
  }
};
