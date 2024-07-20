import { SQL } from "drizzle-orm";
import db from "../db/db";
import videos, { VideosInsertType } from "../db/schema/video.schema";

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
};

export default VideoService;
