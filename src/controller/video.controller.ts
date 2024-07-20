import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { v4 } from "uuid";
import { videos } from "../db/schema";
import env from "../env";
import AWSManager from "../lib/aws";
import STATUS_CODES from "../lib/http-status-codes";
import AuthService from "../service/auth.service";
import VideoService from "../service/video.service";
import {
  VideoUploadPresignedUrl,
  VideoUploadStatusUpdate,
} from "../zod-schema/video.zod";

export const getUploadPresignedUrl = async (req: Request, res: Response) => {
  const { contentType, fileName, title, description } =
    req.body as VideoUploadPresignedUrl;
  const { adminId } = AuthService.getAuthId(req);
  const videoId = v4();
  const key = `videos/${videoId}/${fileName}`;
  const uploadUrl = await AWSManager.getSignedUrlForUpload(key, contentType);
  await VideoService.createVideo({
    videoId,
    adminId,
    s3BucketName: env.AWS_VIDEO_UPLOAD_BUCKET,
    s3ObjectKey: key,
    contentType,
    title,
    description,
    uploadStatus: "pending",
  });
  res.sendSuccess({ uploadUrl, videoId });
};

export const updateVideoUploadStatus = async (req: Request, res: Response) => {
  const { objectKey } = req.body as VideoUploadStatusUpdate;
  if (!objectKey) {
    res.sendError("Invalid object key", STATUS_CODES.BAD_REQUEST);
  }
  await VideoService.updateVideo(
    { uploadStatus: "completed" },
    eq(videos.s3ObjectKey, objectKey)
  );

  res.sendSuccess({ status: "completed" });
};
