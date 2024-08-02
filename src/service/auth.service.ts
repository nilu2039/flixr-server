import { google } from "googleapis";
import { Request } from "express";
import env from "../env";
import { UserService } from "./user.service";
import logger from "../lib/logger";
import db from "../db/db";
import { eq } from "drizzle-orm";
import { editors } from "../db/schema";
import EditorService from "./editor.service";
import redisClient from "../lib/redis";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL
);

const AuthService = {
  async me(id: number, role: "admin" | "editor") {
    if (role === "admin") {
      const cachedUser = await redisClient.get(`user:${id}`);
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }
      try {
        const user = await UserService.getUserById(
          id,
          {
            id: true,
            name: true,
            role: true,
            verified: true,
            profileUrlImage: true,
            ytChannelName: true,
          },
          true
        );
        if (!user) {
          throw new Error("User not found");
        }
        redisClient.set(`user:${id}`, JSON.stringify(user), "EX", 60 * 60);
        return user;
      } catch (error) {
        throw error;
      }
    }
    const cachedEditor = await redisClient.get(`editor:${id}`);
    if (cachedEditor) {
      return JSON.parse(cachedEditor);
    }
    const _editor = await EditorService.getEditorById(id, {
      id: true,
      name: true,
      role: true,
      verified: true,
    });
    if (!_editor) {
      throw new Error("Editor not found");
    }
    const res = {
      ..._editor,
      ytChannelName: _editor.admin.ytChannelName,
    };
    redisClient.set(`editor:${id}`, JSON.stringify(res), "EX", 60 * 60);
    return res;
  },
  async refreshGoogleAccessToken(userId: number) {
    try {
      logger.info("Refreshing access token");
      const user = await UserService.getUserById(userId);
      if (!user || !user.googleRefreshToken) {
        throw new Error("User not found or no refresh token");
      }
      oauth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });
      const { credentials } = await oauth2Client.refreshAccessToken();
      if (!credentials.access_token || !credentials.expiry_date) {
        throw new Error("Error refreshing access token");
      }
      await UserService.updateUser(userId, {
        googleAccessToken: credentials.access_token,
        googleExpiresIn: Date.now() + (credentials.expiry_date ?? 3600000),
      });

      return {
        googleAccessToken: credentials.access_token,
        googleExpiresIn: Date.now() + (credentials.expiry_date ?? 3600000),
      };
    } catch (error) {
      console.error("Error refreshing access token", error);
      throw error;
    }
  },
  async getAuthId(
    req: Request
  ): Promise<{ adminId: number; editorId: number | null }> {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    if (req.user.role === "admin") {
      return { adminId: req.user.id, editorId: null };
    }

    const editorWithAdmin = await db.query.editors.findFirst({
      where: eq(editors.id, req.user.id),
      with: {
        admin: { columns: { id: true } },
      },
    });

    if (!editorWithAdmin) {
      throw new Error("User not authenticated");
    }

    return { adminId: editorWithAdmin.admin.id, editorId: req.user.id };
  },
};

export default AuthService;
