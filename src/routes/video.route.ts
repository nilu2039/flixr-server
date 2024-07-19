import { Router } from "express";
import { getUploadPresignedUrl } from "src/controller/video.controller";

const router = Router();

router.get("/get-upload-presigned-url", getUploadPresignedUrl);

export default router;
