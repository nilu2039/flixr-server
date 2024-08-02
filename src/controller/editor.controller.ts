import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import argon2 from "argon2";
import EditorService from "../service/editor.service";
import STATUS_CODES from "../lib/http-status-codes";
import { EditorCreate, EditorResetPassword } from "../zod-schema/editor.zod";
import logger from "../lib/logger";
import redisClient from "../lib/redis";

export const createEditor = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.sendError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
  }
  const { name, email } = req.body as EditorCreate;
  const password = uuid();
  const username = uuid();
  const hashedPassword = await argon2.hash(password);
  try {
    await EditorService.createEditor({
      name,
      username,
      password: hashedPassword,
      adminId: req.user.id,
      email,
    });
    res.sendSuccess({ status: "success", username, password });
  } catch (error) {
    logger.error(error);
    if (error?.code === "23505") {
      return res.sendError("Email already exists", STATUS_CODES.BAD_REQUEST);
    }
    res.sendError("Failed to create editor", STATUS_CODES.BAD_REQUEST);
  }
};

export const resetEditorPassword = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.sendError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
  }
  const { password } = req.body as EditorResetPassword;
  const hashedPassword = await argon2.hash(password);
  try {
    await EditorService.updateEditorById(req.user.id, {
      password: hashedPassword,
      verified: true,
    });
    redisClient.del(`editor:${req.user.id}`);
    res.sendSuccess({ status: "success" });
  } catch (error) {
    res.sendError("Failed to reset password", STATUS_CODES.BAD_REQUEST);
  }
};
