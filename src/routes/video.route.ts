import { Router } from "express";
import {
  getUploadPresignedUrl,
  updateVideoUploadStatus,
  updateVideoStatus,
  getAllVideos,
} from "../controller/video.controller";
import {
  validatePostBody,
  validateQuery,
} from "../middleware/validate.middleware";
import {
  videoUploadStatusUpdateSchema,
  videoUploadPresignedBodySchema,
  videoStatusSchema,
  getAllVideosQuerySchema,
} from "../zod-schema/video.zod";
import { idAdminOrEditor, isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/get-all-videos",
  idAdminOrEditor,
  validateQuery(getAllVideosQuerySchema),
  getAllVideos
);

router.post(
  "/get-upload-presigned-url",
  validatePostBody(videoUploadPresignedBodySchema),
  idAdminOrEditor,
  getUploadPresignedUrl
);

router.post(
  "/update-video-status",
  isAdmin,
  validatePostBody(videoStatusSchema),
  updateVideoStatus
);

router.post(
  "/update-video-upload-status",
  validatePostBody(videoUploadStatusUpdateSchema),
  updateVideoUploadStatus
);

export default router;
