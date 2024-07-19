import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { GOOGLE_SCOPES } from "../constants";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: GOOGLE_SCOPES,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("accessToken", accessToken);
      console.log("refreshToken", refreshToken);
      console.log("profile", profile);
      const user = {
        id: profile.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: profile._json.exp,
      };
      done(null, user);
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  const _user: Express.User = {
    id: user.id,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    expiresIn: user.expiresIn,
  };
  done(null, _user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user as Express.User);
});
