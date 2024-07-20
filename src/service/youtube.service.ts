import { ReadStream } from "fs";
import { open } from "fs/promises";
import { google, youtube_v3 } from "googleapis";
import { DownloaderHelper } from "node-downloader-helper";
import path from "path";
import env from "../env";
import AWSManager from "../lib/aws";
import { UserService } from "./user.service";
import logger from "../lib/logger";
import { updateVideoUploadYoutubeStatus } from "../utils/video";

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

      if (!userWithVideo || userWithVideo?.videos.length === 0) {
        throw new Error("Video not found");
      }

      const videoUrl = await AWSManager.getSignedUrlForDownload(
        userWithVideo.videos[0].s3ObjectKey,
        env.AWS_VIDEO_UPLOAD_BUCKET.trim()
      );

      if (!videoUrl) {
        throw new Error("Video not found");
      }

      const video = userWithVideo.videos[0];
      const dl = new DownloaderHelper(
        videoUrl,
        path.join(__dirname, "..", "tmp"),
        {
          fileName: video.fileName,
          override: true,
          removeOnFail: true,
        }
      );

      updateVideoUploadYoutubeStatus(uploadVideoId, "started");
      const videoPath = path.join(__dirname, "..", "tmp", video.fileName);

      dl.on("progress", (progress) => {
        console.log(progress.progress, progress.total, progress.speed);
      });
      dl.on("error", (err) => {
        logger.error("Failed to download video 1", err);
        updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
      });
      dl.start().catch((err) => {
        logger.error("Failed to download video 2", err);
        updateVideoUploadYoutubeStatus(uploadVideoId, "failed");
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

          YoutubeService.uploadVideoToYoutube(
            auth,
            videoDetails,
            uploadVideoId
          );
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

  async uploadVideoToYoutube(
    auth: Partial<Express.User>,
    videoDetails: {
      title: string;
      description: string;
      tags: string[];
      categoryId: string;
      privacyStatus: string;
      mediaStream: ReadStream;
    },
    uploadVideoId: string
  ): Promise<youtube_v3.Schema$Video | null> {
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
  },
};
