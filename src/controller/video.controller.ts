import { and, eq } from "drizzle-orm";
import { Request, Response } from "express";
import { v4 } from "uuid";
import { videos } from "../db/schema";
import env from "../env";
import AWSManager from "../lib/aws";
import STATUS_CODES from "../lib/http-status-codes";
import AuthService from "../service/auth.service";
import { UserService } from "../service/user.service";
import VideoService from "../service/video.service";
import {
  getExtensionFromContentType,
  isSupportedThumbnailContentType,
  isSupportedVideoContentType,
} from "../utils/youtube.util";
import {
  EditVideoDetails,
  GetAllVideosQuery,
  GetVideoDetailsQuery,
  VideoStatus,
  VideoUploadPresignedUrl,
  VideoUploadStatusUpdate,
} from "../zod-schema/video.zod";
import { Video } from "../db/schema/video.schema";
import EditorService from "../service/editor.service";
import logger from "../lib/logger";

export const getUploadPresignedUrl = async (req: Request, res: Response) => {
  const { videoContentType, title, description, thumbnailContentType } =
    req.body as VideoUploadPresignedUrl;

  if (!isSupportedVideoContentType(videoContentType)) {
    res.sendError("Invalid content type", STATUS_CODES.BAD_REQUEST);
    return;
  }

  if (
    thumbnailContentType &&
    !isSupportedThumbnailContentType(thumbnailContentType)
  ) {
    res.sendError("Invalid thumbnail content type", STATUS_CODES.BAD_REQUEST);
    return;
  }

  const videoFileExtension = getExtensionFromContentType({
    contentType: videoContentType,
    type: "video",
  });
  const thumbnailFileExtension = getExtensionFromContentType({
    contentType: thumbnailContentType,
    type: "thumbnail",
  });
  if (!videoFileExtension) {
    res.sendError("Invalid video extension", STATUS_CODES.BAD_REQUEST);
    return;
  }

  if (thumbnailContentType && !thumbnailFileExtension) {
    res.sendError("Invalid thumbnail extension", STATUS_CODES.BAD_REQUEST);
    return;
  }

  if (!req.user) {
    throw new Error("User not authenticated");
  }

  const { adminId, editorId } = await AuthService.getAuthId(req);
  const videoId = v4();
  const videoFileName = `${videoId}.${videoFileExtension}`;
  const thumbnailFileName = `thumbnail.${videoId}.${thumbnailFileExtension}`;
  const videoKey = `videos/${videoId}/${videoFileName}`;
  const thumbnailKey = `videos/${videoId}/${thumbnailFileName}`;
  const videoUploadUrl = await AWSManager.getSignedUrlForUpload({
    key: videoKey,
    contentType: videoContentType,
    BucketName: env.AWS_VIDEO_UPLOAD_BUCKET,
  });
  const thumbnailUploadUrl = await AWSManager.getSignedUrlForUpload({
    key: thumbnailKey,
    contentType: thumbnailContentType,
    BucketName: env.AWS_VIDEO_UPLOAD_BUCKET,
  });
  await VideoService.createVideo({
    videoId,
    adminId,
    s3BucketName: env.AWS_VIDEO_UPLOAD_BUCKET,
    s3ObjectKey: videoKey,
    contentType: videoContentType,
    thumbnails3ObjectKey: thumbnailKey,
    thumbnailContentType,
    title,
    description,
    fileName: videoFileName,
    editorId,
    uploaderId: req.user.id,
  });
  res.sendSuccess({ videoUploadUrl, videoId, thumbnailUploadUrl });
};

export const editVideoDetails = async (req: Request, res: Response) => {
  const { videoId, title, description, thumbnailContentType } =
    req.body as EditVideoDetails;
  if (!req.user) {
    res.sendError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
    return;
  }
  let video: Video | null | undefined = null;
  if (req.user.role === "admin") {
    const res = await UserService.getUserByIdWithVideo(req.user.id, videoId);
    video = res?.videos.find((v) => v.videoId === videoId);
  }
  if (req.user.role === "editor") {
    const res = await EditorService.getEditorById(req.user.id, undefined, true);
    video = res?.videos.find((v) => v.videoId === videoId);
  }
  if (!video) {
    res.sendError("Video not found", STATUS_CODES.NOT_FOUND);
    return;
  }
  let thumbnailUploadUrl: string | null = null;
  try {
    if (
      thumbnailContentType &&
      video.thumbnailContentType !== thumbnailContentType
    ) {
      if (!isSupportedThumbnailContentType(thumbnailContentType)) {
        res.sendError(
          "Invalid thumbnail content type",
          STATUS_CODES.BAD_REQUEST
        );
        return;
      }
      const thumbnailFileExtension = getExtensionFromContentType({
        contentType: thumbnailContentType,
        type: "thumbnail",
      });
      if (!thumbnailFileExtension) {
        res.sendError("Invalid thumbnail extension", STATUS_CODES.BAD_REQUEST);
        return;
      }
      const thumbnailFileName = `thumbnail.${video.videoId}.${thumbnailFileExtension}`;
      const thumbnailKey = `videos/${video.videoId}/${thumbnailFileName}`;
      thumbnailUploadUrl = await AWSManager.getSignedUrlForUpload({
        key: thumbnailKey,
        contentType: thumbnailContentType,
        BucketName: env.AWS_VIDEO_UPLOAD_BUCKET,
      });
      await VideoService.updateVideo(
        {
          thumbnails3ObjectKey: thumbnailKey,
          thumbnailContentType,
        },
        eq(videos.videoId, video.videoId)
      );
    } else {
      thumbnailUploadUrl = await AWSManager.getSignedUrlForUpload({
        key: video.thumbnails3ObjectKey,
        contentType: video.thumbnailContentType,
        BucketName: env.AWS_VIDEO_UPLOAD_BUCKET,
      });
    }
    const videoUploadUrl = await AWSManager.getSignedUrlForUpload({
      key: video.s3ObjectKey,
      contentType: video.contentType,
      BucketName: env.AWS_VIDEO_UPLOAD_BUCKET,
    });

    await VideoService.updateVideo(
      { title, description },
      eq(videos.videoId, video.videoId)
    );
    res.sendSuccess({ title, description, videoUploadUrl, thumbnailUploadUrl });
  } catch (error) {
    logger.error("Error updating video details", error);
    res.sendError("Details not updated", STATUS_CODES.BAD_REQUEST);
    return;
  }
};

export const updateVideoUploadStatus = async (req: Request, res: Response) => {
  const { objectKey, status, videoId } = req.body as VideoUploadStatusUpdate;
  if (!objectKey) {
    if (status === "failed" || status === "pending") {
      await VideoService.updateVideo(
        {
          uploadStatus: status,
          fileSize: 0,
        },
        eq(videos.videoId, videoId ?? "")
      );
      res.sendSuccess({ status });
      return;
    }
    res.sendError("Invalid object key", STATUS_CODES.BAD_REQUEST);
    return;
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

export const updateVideoStatus = async (req: Request, res: Response) => {
  if (!req.user) {
    res.sendError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
    return;
  }
  const { status, videoId } = req.body as VideoStatus;
  const user = await UserService.getUserByIdWithVideo(req.user.id, videoId);
  const video = user?.videos.find((v) => v.videoId === videoId);
  if (!video) {
    res.sendError("Video not found", STATUS_CODES.NOT_FOUND);
    return;
  }

  if (video.uploadStatus !== "completed") {
    res.sendError("Video not uploaded", STATUS_CODES.BAD_REQUEST);
    return;
  }

  try {
    await VideoService.updateVideo(
      { status },
      eq(videos.videoId, video.videoId)
    );
    res.sendSuccess({ status });
  } catch (error) {
    res.sendError("Status not updated", STATUS_CODES.BAD_REQUEST);
    return;
  }
};

export const getAllVideos = async (req: Request, res: Response) => {
  if (!req.user) {
    res.sendError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
    return;
  }
  const { editorId } = req.query as GetAllVideosQuery;

  const { id, role } = req.user;

  if (role === "admin") {
    try {
      if (!editorId) {
        const allVideos = await VideoService.getAllVideos({
          where: eq(videos.adminId, id),
        });
        res.sendSuccess(allVideos);
        return;
      }
      const allVideos = await VideoService.getAllVideos({
        where: and(
          eq(videos.adminId, id),
          eq(videos.editorId, parseInt(editorId))
        ),
      });
      res.sendSuccess(allVideos);
      return;
    } catch (error) {
      res.sendError(
        "Error fetching videos",
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  if (role === "editor") {
    try {
      const allVideos = await VideoService.getAllVideos({
        where: eq(videos.editorId, id),
      });
      res.sendSuccess(allVideos);
      return;
    } catch (error) {
      res.sendError(
        "Error fetching videos",
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }
};

export const getVideoDetails = async (req: Request, res: Response) => {
  const { videoId } = req.query as GetVideoDetailsQuery;

  if (!req.user) {
    res.sendError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
    return;
  }

  try {
    const video = await VideoService.getVideoById(videoId);
    if (!video) {
      res.sendError("Video not found", STATUS_CODES.NOT_FOUND);
      return;
    }
    if (req.user.id !== video.adminId && req.user.id !== video.editorId) {
      res.sendError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
      return;
    }
    res.sendSuccess(video);
  } catch (error) {
    res.sendError("Error fetching video", STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};
