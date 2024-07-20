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
import {
  getExtensionFromContentType,
  isSupportedContentType,
} from "../utils/youtube.util";

export const getUploadPresignedUrl = async (req: Request, res: Response) => {
  const { contentType, title, description } =
    req.body as VideoUploadPresignedUrl;

  if (!isSupportedContentType(contentType)) {
    res.sendError("Invalid content type", STATUS_CODES.BAD_REQUEST);
    return;
  }

  const fileExtension = getExtensionFromContentType(contentType);
  if (!fileExtension) {
    res.sendError("Invalid content type", STATUS_CODES.BAD_REQUEST);
    return;
  }
  const { adminId, editorId } = await AuthService.getAuthId(req);
  const videoId = v4();
  const fileName = `${videoId}.${fileExtension}`;
  const key = `videos/${videoId}/${fileName}`;
  const uploadUrl = await AWSManager.getSignedUrlForUpload(
    key,
    contentType,
    env.AWS_VIDEO_UPLOAD_BUCKET
  );
  await VideoService.createVideo({
    videoId,
    adminId,
    s3BucketName: env.AWS_VIDEO_UPLOAD_BUCKET,
    s3ObjectKey: key,
    contentType,
    title,
    description,
    uploadStatus: "pending",
    fileName,
    editorId,
  });
  res.sendSuccess({ uploadUrl, videoId });
};

export const updateVideoUploadStatus = async (req: Request, res: Response) => {
  const { objectKey } = req.body as VideoUploadStatusUpdate;
  if (!objectKey) {
    res.sendError("Invalid object key", STATUS_CODES.BAD_REQUEST);
  }
  const videoObjectDetails = await AWSManager.getObjectDetails(
    objectKey,
    env.AWS_VIDEO_UPLOAD_BUCKET
  );
  if (!videoObjectDetails || !videoObjectDetails.exists) {
    res.sendError("Invalid object key", STATUS_CODES.BAD_REQUEST);
    return;
  }
  await VideoService.updateVideo(
    {
      uploadStatus: "completed",
      fileSize: videoObjectDetails.size,
    },
    eq(videos.s3ObjectKey, objectKey)
  );

  res.sendSuccess({ status: "completed" });
};
