import { Request, Response } from "express";
import STATUS_CODES from "../lib/http-status-codes";
import AuthService from "../service/auth.service";

export const me = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.sendError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
      return;
    }
    const userId = req.user.id;
    const user = await AuthService.me(userId, req.user.role);
    res.sendSuccess({ user });
  } catch (error) {
    res.sendError("Failed to get user", STATUS_CODES.BAD_REQUEST);
  }
};
