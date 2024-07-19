import { google } from "googleapis";
import env from "../env";
import { UserService } from "./user.service";
import logger from "../lib/logger";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL
);

const AuthService = {
  async refreshAccessToken(userId: number) {
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
        googleExpiresIn: Date.now() + (credentials.expiry_date || 3600000),
      });

      return {
        googleAccessToken: credentials.access_token,
        googleExpiresIn: Date.now() + (credentials.expiry_date || 3600000),
      };
    } catch (error) {
      console.error("Error refreshing access token", error);
      throw error;
    }
  },
};

export default AuthService;
