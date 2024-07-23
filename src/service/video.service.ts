import { SQL, sql } from "drizzle-orm";
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
  async getAllVideos({
    where,
  }: {
    where?: SQL;
    withOwner?: boolean;
  }): Promise<Partial<Video>[] | null> {
    try {
      const data = await db.query.videos.findMany({
        ...(where ? { where } : {}),
        columns: {
          s3BucketName: false,
          s3ObjectKey: false,
          fileName: false,
        },
        extras: {
          uploader: sql<{
            id: number;
            name: string;
            role: "admin" | "editor";
          }>`
          CASE
            WHEN ${videos.adminId} = ${videos.uploaderId} THEN (
              SELECT json_build_object('id', id, 'name', name, 'role', role)
              FROM users
              WHERE id = ${videos.uploaderId}
            )
            WHEN ${videos.editorId} = ${videos.uploaderId} THEN (
              SELECT json_build_object('id', id, 'name', name, 'role', role)
              FROM editors
              WHERE id = ${videos.uploaderId}
            )
            ELSE NULL
          END
        `.as("uploader"),
        },
      });
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default VideoService;
