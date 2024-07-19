import { Router } from "express";
import passport from "passport";
import { GOOGLE_SCOPES } from "../constants";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: GOOGLE_SCOPES,
    accessType: "offline",
    prompt: "consent",
  }),
  (_, res) => res.send(200)
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (_, res) => {
    res.redirect("http://localhost:3000/dashboard");
  }
);

export default router;
