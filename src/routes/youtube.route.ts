import { Router } from "express";
import {
  uploadToYoutube,
  youtubeUploadStatus,
} from "../controller/youtube.controller";
import { checkGoogleAccessToken, isAdmin } from "../middleware/auth.middleware";
import { validatePostBody } from "../middleware/validate.middleware";
import { uploadToYoutubeSchema } from "../zod-schema/youtube.zod";

const router = Router();

router.post(
  "/upload-youtube",
  checkGoogleAccessToken,
  isAdmin,
  validatePostBody(uploadToYoutubeSchema),
  uploadToYoutube
);
router.get("/upload-youtube-status/:uploadId", isAdmin, youtubeUploadStatus);

export default router;
