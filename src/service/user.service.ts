import { eq } from "drizzle-orm";
import { google } from "googleapis";
import { GOOGLE_SCOPES } from "../constants";
import db from "../db/db";
import users, { User, UsersInsertType } from "../db/schema/user.schema";
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
      throw error;
    }
  },
  async getUserById(
    id: number,
    columns?: Partial<Record<keyof User, boolean>>,
    withEditors = false
  ): Promise<Partial<User> | null> {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        ...(columns ? { columns } : {}),
        ...(withEditors
          ? {
              with: {
                editors: {
                  columns: {
                    id: true,
                    name: true,
                    role: true,
                    verified: true,
                  },
                },
              },
            }
          : {}),
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
  async hasRequiredScopes(userId: number): Promise<boolean> {
    try {
      const user = await UserService.getUserById(userId, {
        googleAccessToken: true,
        googleRefreshToken: true,
      });
      if (!user) {
        return false;
      }
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
      });
      if (!oauth2Client.credentials.access_token) {
        return false;
      }
      const tokenInfo = await google.oauth2("v2").tokeninfo({
        access_token: oauth2Client.credentials.access_token,
      });

      if (!tokenInfo.data.scope) {
        return false;
      }

      const grantedScopes = tokenInfo.data.scope.split(" ");
      const missingScopes = GOOGLE_SCOPES.filter(
        (scope) => !grantedScopes.includes(scope)
      );
      if (missingScopes.length > 0) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  },
};
