import { Router } from "express";
import {
  uploadToYoutube,
  uploadStatus,
} from "../controller/youtube.controller";
import { checkGoogleAccessToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/upload-youtube", checkGoogleAccessToken, uploadToYoutube);
router.get("/upload-status/:uploadId", uploadStatus);

export default router;
