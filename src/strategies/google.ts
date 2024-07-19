import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { GOOGLE_SCOPES } from "../constants";
import env from "../env";
import { UsersInsertType } from "../db/schema";
import { UserService } from "../service/user.service";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      callbackURL: env.GOOGLE_CALLBACK_URL!,
      scope: GOOGLE_SCOPES,
    },
    async (accessToken, refreshToken, profile, done) => {
      const useObj: UsersInsertType = {
        googleId: profile.id,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        profileUrlImage: profile.photos?.[0].value ?? "",
        googleExpiresIn: Date.now() + 3600000,
        email: profile.emails?.[0].value ?? "",
        name: profile.displayName,
        username: profile.displayName,
        role: "admin",
      };
      const user = await UserService.createUser(useObj);
      done(null, {
        googleAccessToken: user.googleAccessToken,
        googleExpiresIn: user.googleExpiresIn,
        googleRefreshToken: user.googleRefreshToken,
        id: user.id,
      });
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  const _user: Express.User = {
    id: user.id,
    googleAccessToken: user.googleAccessToken,
    googleRefreshToken: user.googleRefreshToken,
    googleExpiresIn: user.googleExpiresIn,
  };
  done(null, _user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user as Express.User);
});
