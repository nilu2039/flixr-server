import { eq } from "drizzle-orm";
import { google } from "googleapis";
import internal from "stream";
import { videos } from "../db/schema";
import env from "../env";
import AWSManager from "../lib/aws";
import logger from "../lib/logger";
import { updateVideoUploadYoutubeStatus } from "../utils/video";
import { UserService } from "./user.service";
import VideoService from "./video.service";

const youtube = google.youtube("v3");

export const YoutubeService = {
  async prepareVideoForUpload({
    videoId,
    visibility,
    userId,
    uploadVideoId,
  }: {
    videoId: string;
    visibility: string;
    userId: number;
    uploadVideoId: string;
  }) {
    try {
      const userWithVideo = await UserService.getUserByIdWithVideo(
        userId,
        videoId
      );

      const hasRequiredScopes = await UserService.hasRequiredScopes(userId);
      if (!hasRequiredScopes) {
        throw new Error(
          "You have not granted required permissions, please sign in again!"
        );
      }

      if (!userWithVideo || userWithVideo?.videos.length === 0) {
        throw new Error("Video not found");
      }

      const video = userWithVideo.videos.find(
        (video) => video.videoId === videoId
      );

      if (!video || video.uploadStatus !== "completed") {
        throw new Error("Video not found");
      }

      if (video.youtubeUploadStatus === "pending") {
        throw new Error("Video already uploading to youtube");
      }

      if (video.youtubeUploadStatus === "completed") {
        throw new Error("Video already uploaded to youtube");
      }

      if (video.status !== "accepted") {
        throw new Error("Video not accepted");
      }

      const videoUrl = await AWSManager.getSignedUrlForDownload(
        video.s3ObjectKey,
        env.AWS_VIDEO_UPLOAD_BUCKET.trim()
      );

      if (!videoUrl) {
        throw new Error("Video not found");
      }

      updateVideoUploadYoutubeStatus(uploadVideoId, "started");

      await VideoService.updateVideo(
        { youtubeUploadStatus: "pending" },
        eq(videos.videoId, video.videoId)
      );

      try {
        const s3VideoStream = await AWSManager.createReadStream(
          video.s3ObjectKey,
          env.AWS_VIDEO_UPLOAD_BUCKET.trim()
        );
        const s3ThumbnailStream = await AWSManager.createReadStream(
          video.thumbnails3ObjectKey,
          env.AWS_VIDEO_UPLOAD_BUCKET.trim()
        );
        if (!s3VideoStream) {
          throw new Error("Failed to get video stream");
        }
        const videoDetails = {
          title: video.title,
          description: video.description,
          categoryId: "22",
          privacyStatus: visibility,
          mediaStream: s3VideoStream,
        };
        const auth: Partial<Express.User> = {
          googleAccessToken: userWithVideo.googleAccessToken,
          googleRefreshToken: userWithVideo.googleRefreshToken,
          googleExpiresIn: userWithVideo.googleExpiresIn,
        };
        YoutubeService.uploadVideoToYoutube({
          auth,
          videoDetails,
          uploadVideoId,
          s3ThumbnailStream,
          onSuccess: async () => {
            logger.info("Video uploaded successfully");
            await VideoService.updateVideo(
              { youtubeUploadStatus: "completed" },
              eq(videos.videoId, video.videoId)
            );
          },
          onFailure: async (error) => {
            logger.error(error);
            await VideoService.updateVideo(
              { youtubeUploadStatus: "failed" },
              eq(videos.videoId, video.videoId)
            );
          },
        });
      } catch (error) {
        logger.error(error);
        updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
        throw error;
      }
    } catch (error) {
      updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
      throw error;
    }
  },

  async uploadVideoToYoutube({
    auth,
    uploadVideoId,
    videoDetails,
    s3ThumbnailStream,
    onSuccess = () => {},
    onFailure = () => {},
  }: {
    auth: Partial<Express.User>;
    videoDetails: {
      title: string;
      description: string;
      categoryId: string;
      privacyStatus: string;
      mediaStream: internal.Readable;
    };
    s3ThumbnailStream: internal.Readable | null;
    onSuccess: () => void;
    onFailure: (error: any) => void;
    uploadVideoId: string;
  }) {
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
      await youtube.thumbnails.set({
        auth: oauth2Client,
        videoId: res.data.id ?? "",
        media: {
          body: s3ThumbnailStream,
        },
      });
      logger.info("Video uploaded", res.data.id);
      updateVideoUploadYoutubeStatus(uploadVideoId, "completed");
      onSuccess();
      return res.data;
    } catch (error) {
      logger.error("Error uploading video", error);
      updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
      onFailure(error);
      return null;
    }
  },

  async getChannelInfo({
    googleAccessToken,
    googleRefreshToken,
  }: {
    googleAccessToken: string;
    googleRefreshToken: string;
  }): Promise<{
    channelName: string;
    channelId: string;
  } | null> {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: googleAccessToken,
      refresh_token: googleRefreshToken,
    });
    try {
      const response = await youtube.channels.list({
        auth: oauth2Client,
        part: ["snippet"],
        mine: true,
      });
      if (response.data.items && response.data.items.length > 0) {
        const channelName = response.data.items[0].snippet?.title;
        const channelId = response.data.items[0].id;
        logger.info("YouTube Channel Name:", channelName);
        if (!channelName || !channelId) return null;
        return { channelName, channelId };
      } else {
        logger.info("No channel found for this user.");
        return null;
      }
    } catch (error) {
      logger.error("Error getting channel info", error);
      return null;
    }
  },
};
