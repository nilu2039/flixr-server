import { Router } from "express";
import { upload, uploadStatus } from "../controller/youtube.controller";

const router = Router();

router.get("/upload", upload);
router.get("/upload-status/:uploadId", uploadStatus);

export default router;
