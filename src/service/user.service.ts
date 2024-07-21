import users, { User, UsersInsertType } from "../db/schema/user.schema";
import db from "../db/db";
import { eq } from "drizzle-orm";
import logger from "../lib/logger";

export const UserService = {
  async createUser(data: UsersInsertType): Promise<User | null> {
    try {
      const user = await db
        .insert(users)
        .values(data)
        .onConflictDoUpdate({
          target: [users.googleId],
          set: {
            email: data.email,
            name: data.name,
            googleAccessToken: data.googleAccessToken,
            googleExpiresIn: data.googleExpiresIn,
            googleRefreshToken: data.googleRefreshToken,
            username: data.username,
            role: data.role,
            profileUrlImage: data.profileUrlImage,
          },
        })
        .returning();
      return user[0];
    } catch (error) {
      return null;
    }
  },
  async getUserById(
    id: number,
    columns?: Partial<Record<keyof User, boolean>>
  ): Promise<Partial<User> | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        ...(columns ? { columns } : {}),
      });
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  },
  async updateUser(
    id: number,
    data: Partial<UsersInsertType>
  ): Promise<User | null> {
    try {
      const user = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return user[0];
    } catch (error) {
      return null;
    }
  },
  async getUserByIdWithVideo(userId: number, videoId: string) {
    try {
      return await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
          videos: {
            where: (videos) => eq(videos.videoId, videoId),
            limit: 1,
          },
        },
        columns: {
          id: true,
          googleAccessToken: true,
          googleExpiresIn: true,
          googleId: true,
          googleRefreshToken: true,
        },
      });
    } catch (error) {
      logger.error(error);
      return null;
    }
  },
};
