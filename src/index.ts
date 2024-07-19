import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import RedisStore from "connect-redis";

import "./strategies/google";
import logger from "./lib/logger";
import authRoutes from "./routes/auth";
import youtubeRoutes from "./routes/youtube";
import redisClient from "./lib/redis";
import env from "./env";

interface ExpressUser {
  id: number;
  googleAccessToken: string;
  googleRefreshToken: string;
  googleExpiresIn: number;
}

declare global {
  namespace Express {
    interface User extends ExpressUser {}
  }
}

const main = async () => {
  const app = express();
  const PORT = env.PORT || 4000;

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "flixr:",
  });

  app.use(
    session({
      name: "qid",
      store: redisStore,
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api/auth", authRoutes);
  app.use("/api", youtubeRoutes);

  app.listen(PORT, () => {
    logger.info(`Server started on PORT :${PORT}`);
  });
};

main();
