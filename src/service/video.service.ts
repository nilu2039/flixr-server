import { SQL } from "drizzle-orm";
import db from "../db/db";
import videos, { Video, VideosInsertType } from "../db/schema/video.schema";

const VideoService = {
  async createVideo(data: VideosInsertType): Promise<null> {
    await db.insert(videos).values(data);
    return null;
  },
  async updateVideo(
    data: Partial<VideosInsertType>,
    where: SQL
  ): Promise<null> {
    await db.update(videos).set(data).where(where);
    return null;
  },
  async getAllVideos(where?: SQL): Promise<Partial<Video>[] | null> {
    try {
      const data = await db.query.videos.findMany({
        ...(where ? { where } : {}),
        columns: {
          s3BucketName: false,
          s3ObjectKey: false,
          fileName: false,
          adminId: false,
        },
      });
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default VideoService;
