import { Router } from "express";
import {
  getUploadPresignedUrl,
  updateVideoUploadStatus,
} from "../controller/video.controller";
import { validatePostBody } from "../middleware/validate.middleware";
import {
  VideoUploadStatusUpdateSchema,
  videoUploadPresignedBodySchema,
} from "../zod-schema/video.zod";
import { idAdminOrEditor } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/get-upload-presigned-url",
  validatePostBody(videoUploadPresignedBodySchema),
  idAdminOrEditor,
  getUploadPresignedUrl
);

router.post(
  "/update-video-upload-status",
  validatePostBody(VideoUploadStatusUpdateSchema),
  updateVideoUploadStatus
);

export default router;
