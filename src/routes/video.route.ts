import { Router } from "express";
import { getUploadPresignedUrl } from "../controller/video.controller";
import validateQuery from "../middleware/validate.middleware";
import { videoUploadPresignedUrlSchema } from "../zod-schema/video.zod";

const router = Router();

router.get(
  "/get-upload-presigned-url",
  validateQuery(videoUploadPresignedUrlSchema),
  getUploadPresignedUrl
);

export default router;
