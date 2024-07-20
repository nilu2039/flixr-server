import { Request, Response } from "express";
import { UploadToYoutube } from "../zod-schema/youtube.zod";
import STATUS_CODES from "../lib/http-status-codes";
import { generateVideoUploadId, getVideoUploadStatus } from "../utils/video";
import { YoutubeService } from "../service/youtube.service";

export const uploadToYoutube = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.sendError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
  }
  const { videoId, visibility } = req.body as UploadToYoutube;

  const uploadVideoId = generateVideoUploadId();

  try {
    await YoutubeService.prepareVideoForUpload({
      userId: req.user.id,
      videoId,
      visibility,
      uploadVideoId,
    });
    res.sendSuccess({ status: "started", uploadId: uploadVideoId });
  } catch (error) {
    console.log("MAIN ERROR: ", error);
    res.sendError(error.message, STATUS_CODES.BAD_REQUEST);
  }
};

export const uploadStatus = async (req: Request, res: Response) => {
  const uploadId = req.params.uploadId;
  const status = await getVideoUploadStatus(uploadId);
  if (!status) {
    res.sendError("Upload not found", STATUS_CODES.NOT_FOUND);
    return;
  }
  res.sendSuccess({ status });
};
