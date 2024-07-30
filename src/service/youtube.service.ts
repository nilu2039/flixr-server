import { eq } from "drizzle-orm";
import { ReadStream } from "fs";
import { open, unlink } from "fs/promises";
import { google } from "googleapis";
import { DownloaderHelper } from "node-downloader-helper";
import path from "path";
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

      const dl = new DownloaderHelper(videoUrl, "/tmp", {
        fileName: video.fileName,
        override: true,
        removeOnFail: true,
      });

      updateVideoUploadYoutubeStatus(uploadVideoId, "started");
      const videoPath = path.join("/tmp", video.fileName);

      await VideoService.updateVideo(
        { youtubeUploadStatus: "pending" },
        eq(videos.videoId, video.videoId)
      );

      dl.on("error", async (err) => {
        logger.error("Failed to download video 1", err);
        updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
        await VideoService.updateVideo(
          { youtubeUploadStatus: "failed" },
          eq(videos.videoId, video.videoId)
        );
      });
      dl.start().catch(async (err) => {
        logger.error("Failed to download video 2", err);
        updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
        await VideoService.updateVideo(
          { youtubeUploadStatus: "failed" },
          eq(videos.videoId, video.videoId)
        );
      });
      dl.on("end", async () => {
        try {
          const fileHandle = await open(videoPath, "r");
          const mediaStream = fileHandle.createReadStream();
          const videoDetails = {
            title: video.title,
            description: video.description,
            tags: ["test", "video"],
            categoryId: "22",
            privacyStatus: visibility,
            mediaStream,
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
            onSuccess: async () => {
              await unlink(videoPath);
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
          updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
          throw error;
        }
      });
    } catch (error) {
      updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
      throw error;
    }
  },

  async uploadVideoToYoutube({
    auth,
    uploadVideoId,
    videoDetails,
    onSuccess = () => {},
    onFailure = () => {},
  }: {
    auth: Partial<Express.User>;
    videoDetails: {
      title: string;
      description: string;
      tags: string[];
      categoryId: string;
      privacyStatus: string;
      mediaStream: ReadStream;
    };
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
      onSuccess();
      return res.data;
    } catch (error) {
      logger.error("Error uploading video", error);
      updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
      onFailure(error);
      return null;
    }
  },
};
