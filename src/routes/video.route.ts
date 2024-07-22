import { Router } from "express";
import {
  getUploadPresignedUrl,
  updateVideoUploadStatus,
  updateVideoStatus,
} from "../controller/video.controller";
import { validatePostBody } from "../middleware/validate.middleware";
import {
  videoUploadStatusUpdateSchema,
  videoUploadPresignedBodySchema,
  videoStatusSchema,
} from "../zod-schema/video.zod";
import { idAdminOrEditor, isAdmin } from "../middleware/auth.middleware";

const router = Router();

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
