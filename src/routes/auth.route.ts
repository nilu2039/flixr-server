import { Router } from "express";
import passport from "passport";
import { GOOGLE_SCOPES } from "../constants";
import { validatePostBody } from "../middleware/validate.middleware";
import { editorLoginSchema } from "../zod-schema/editor.zod";
import STATUS_CODES from "../lib/http-status-codes";
import { IVerifyOptions } from "passport-local";
import { me } from "../controller/auth.controller";
import env from "../env";

const router = Router();

router.get("/me", me);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: GOOGLE_SCOPES,
    accessType: "offline",
    prompt: "consent",
  }),
  (_, res) => res.sendStatus(STATUS_CODES.OK)
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (_, res) => {
    res.redirect(env.FE_GOOGLE_REDIRECT_URL);
  }
);

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.sendError(
        "Error logging out",
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  });
  res.clearCookie("qid");
  res.sendSuccess("Logged out successfully", STATUS_CODES.OK);
});

router.post(
  "/login-editor",
  validatePostBody(editorLoginSchema),
  (req, res, next) => {
    passport.authenticate(
      "local",
      (err: any, user: Express.User | false, info: IVerifyOptions) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.sendError(info.message, STATUS_CODES.UNAUTHORIZED);
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.sendSuccess("Logged in successfully", STATUS_CODES.OK);
        });
      }
    )(req, res, next);
  }
);

export default router;
