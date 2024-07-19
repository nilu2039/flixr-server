import { Request, Response } from "express";
import { createReadStream } from "fs";
import path from "path";
import {
  generateVideoUploadId,
  getVideoUploadStatus,
  updateVideoUploadStatus,
} from "../utils/video";
import logger from "../lib/logger";
import { uploadVideo } from "../service/youtube.service";

export const upload = async (req: Request, res: Response) => {
  if (!req.user) {
    logger.error("User not authenticated");
    res.status(401).send("User not authenticated");
    return;
  }

  //read video file from file system
  const videoPath = path.join(__dirname, "..", "dummy", "video.mp4");
  const video = createReadStream(videoPath);

  const videoDetails = {
    title: "Test video",
    description: "Test video description",
    tags: ["test", "video"],
    categoryId: "22",
    privacyStatus: "private",
    mediaStream: video,
  };

  const auth = {
    id: req.user.id,
    accessToken: req.user.accessToken,
    refreshToken: req.user.refreshToken,
    expiresIn: req.user.expiresIn,
  };

  const uploadVideoId = generateVideoUploadId();
  updateVideoUploadStatus(uploadVideoId, "started");

  uploadVideo(auth, videoDetails, uploadVideoId);
  res.json({
    status: "started",
    uploadId: uploadVideoId,
  });
};

export const uploadStatus = async (req: Request, res: Response) => {
  const uploadId = req.params.uploadId;
  const status = await getVideoUploadStatus(uploadId);
  res.json({
    status,
  });
};
