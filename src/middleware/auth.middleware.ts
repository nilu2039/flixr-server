import STATUS_CODES from "../lib/http-status-codes";
import AuthService from "../service/auth.service";
import { Request, Response, NextFunction } from "express";

export const checkGoogleAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.googleAccessToken || !req.user.googleExpiresIn) {
    res.sendError("User not authorized", STATUS_CODES.UNAUTHORIZED);
    return;
  }
  if (Date.now() > req.user.googleExpiresIn) {
    try {
      const credentials = await AuthService.refreshGoogleAccessToken(
        req.user.id
      );
      req.user.googleAccessToken = credentials.googleAccessToken;
      req.user.googleExpiresIn = credentials.googleExpiresIn;
    } catch (error) {
      res.sendError("Failed to refresh token", STATUS_CODES.UNAUTHORIZED);
      return;
    }
  }

  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    res.sendError("Access forbidden", STATUS_CODES.FORBIDDEN);
    return;
  }
  next();
};

export const isEditor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "editor") {
    res.sendError("Access forbidden", STATUS_CODES.FORBIDDEN);
    return;
  }
  next();
};

export const idAdminOrEditor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "editor")) {
    res.sendError("Unauthorized", STATUS_CODES.FORBIDDEN);
    return;
  }
  next();
};
