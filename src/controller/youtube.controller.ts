import { Request, Response } from "express";
// import { createReadStream } from "fs";
// import path from "path";
import {
  generateVideoUploadId,
  getVideoUploadStatus,
  updateVideoUploadStatus,
} from "../utils/video";
import logger from "../lib/logger";
// import { uploadVideoToYoutube } from "../service/youtube.service";

export const uploadToYoutube = async (req: Request, res: Response) => {
  if (!req.user) {
    logger.error("User not authenticated");
    res.status(401).send("User not authenticated");
    return;
  }

  //read video file from file system

  // const videoPath = path.join(__dirname, "..", "dummy", "video.mp4");
  // const video = createReadStream(videoPath);

  // const videoDetails = {
  //   title: "Test video",
  //   description: "Test video description",
  //   tags: ["test", "video"],
  //   categoryId: "22",
  //   privacyStatus: "private",
  //   mediaStream: video,
  // };

  // const auth: Express.User = {
  //   id: req.user.id,
  //   googleAccessToken: req.user.googleAccessToken,
  //   googleRefreshToken: req.user.googleRefreshToken,
  //   googleExpiresIn: req.user.googleExpiresIn,
  // };

  const uploadVideoId = generateVideoUploadId();
  updateVideoUploadStatus(uploadVideoId, "started");

  // uploadVideoToYoutube(auth, videoDetails, uploadVideoId);
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
