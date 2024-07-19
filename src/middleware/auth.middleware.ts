import AuthService from "../service/auth.service";
import { Request, Response, NextFunction } from "express";

export const checkGoogleAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }
  if (Date.now() > req.user.googleExpiresIn) {
    try {
      const credentials = await AuthService.refreshAccessToken(req.user.id);
      req.user.googleAccessToken = credentials.googleAccessToken;
      req.user.googleExpiresIn = credentials.googleExpiresIn;
    } catch (error) {
      res.status(401).json({ error: "Failed to refresh token" });
      return;
    }
  }

  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }
  next();
};

export const isEditor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "editor") {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }
  next();
};
