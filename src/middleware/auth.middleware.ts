import AuthService from "../service/auth.service";
import { Request, Response, NextFunction } from "express";

export const checkGoogleAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    res.sendError("User not authenticated", 401);
    return;
  }
  if (Date.now() > req.user.googleExpiresIn) {
    try {
      const credentials = await AuthService.refreshAccessToken(req.user.id);
      req.user.googleAccessToken = credentials.googleAccessToken;
      req.user.googleExpiresIn = credentials.googleExpiresIn;
    } catch (error) {
      res.sendError("Failed to refresh token", 401);
      return;
    }
  }

  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    res.sendError("Unauthorized", 403);
    return;
  }
  next();
};

export const isEditor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "editor") {
    res.sendError("Unauthorized", 403);
    return;
  }
  next();
};
