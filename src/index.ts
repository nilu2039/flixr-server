import "dotenv/config";
import express from "express";
import session from "express-session";
import passport from "passport";
import RedisStore from "connect-redis";
import cors from "cors";

import "./strategies/google";
import "./strategies/local";

import logger from "./lib/logger";
import authRoutes from "./routes/auth.route";
import youtubeRoutes from "./routes/youtube.route";
import videoRoutes from "./routes/video.route";
import redisClient from "./lib/redis";
import editorRoutes from "./routes/editor.route";
import env from "./env";
import { User } from "./db/schema/user.schema";
import { responseMiddleware } from "./middleware/response.middleware";

interface ExpressUser {
  id: number;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleExpiresIn?: number;
  role: User["role"];
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

  app.set("trust proxy", true);

  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS,
      credentials: true,
    })
  );

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
        domain: env.NODE_ENV === "production" ? ".nilanjan.xyz" : undefined,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.json());
  app.use(responseMiddleware);

  app.use("/api/auth", authRoutes);
  app.use("/api", editorRoutes);
  app.use("/api", youtubeRoutes);
  app.use("/api", videoRoutes);

  app.listen(PORT, () => {
    logger.info(`Server started on PORT :${PORT}`);
  });
};

main();
