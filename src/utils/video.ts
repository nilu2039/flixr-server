import { REDIS_UPLOAD_ID_PREFIX } from "../constants";
import redisClient from "../lib/redis";
import { VideoUploadStatus } from "../types/video.type";
import { v4 } from "uuid";

export const generateVideoUploadId = () => {
  return v4();
};

export const generateVideoUploadRedisKey = (id: string) => {
  return `${REDIS_UPLOAD_ID_PREFIX}${id}`;
};

export const updateVideoUploadStatus = (
  id: string,
  status: VideoUploadStatus
) => {
  redisClient.set(generateVideoUploadRedisKey(id), status);
};

export const getVideoUploadStatus = async (
  id: string
): Promise<VideoUploadStatus> => {
  const key = generateVideoUploadRedisKey(id);
  const res = await redisClient.get(key);
  if (!res) return "uploading";
  return res as VideoUploadStatus;
};
