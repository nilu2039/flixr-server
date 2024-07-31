import { Router } from "express";
import {
  editVideoDetails,
  getAllVideos,
  getUploadPresignedUrl,
  getVideoDetails,
  updateVideoStatus,
  updateVideoUploadStatus,
} from "../controller/video.controller";
import { idAdminOrEditor, isAdmin } from "../middleware/auth.middleware";
import {
  validatePostBody,
  validateQuery,
} from "../middleware/validate.middleware";
import {
  editVideoDetailsSchema,
  getAllVideosQuerySchema,
  getVideoDetailsQuerySchema,
  videoStatusSchema,
  videoUploadPresignedBodySchema,
  videoUploadStatusUpdateSchema,
} from "../zod-schema/video.zod";

const router = Router();

router.get(
  "/get-all-videos",
  idAdminOrEditor,
  validateQuery(getAllVideosQuerySchema),
  getAllVideos
);

router.get(
  "/get-video-details",
  idAdminOrEditor,
  validateQuery(getVideoDetailsQuerySchema),
  getVideoDetails
);

router.post(
  "/get-upload-presigned-url",
  validatePostBody(videoUploadPresignedBodySchema),
  idAdminOrEditor,
  getUploadPresignedUrl
);

router.post(
  "/edit-video-details",
  idAdminOrEditor,
  validatePostBody(editVideoDetailsSchema),
  editVideoDetails
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
