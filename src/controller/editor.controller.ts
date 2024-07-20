import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import argon2 from "argon2";
import EditorService from "../service/editor.service";
import STATUS_CODES from "../lib/http-status-codes";
import { EditorResetPassword } from "../zod-schema/editor.zod";

export const createEditor = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.sendError("Unauthorized", STATUS_CODES.UNAUTHORIZED);
  }
  const password = uuid();
  const username = uuid();
  const hashedPassword = await argon2.hash(password);
  console.log("PASSWORD: ", password);
  try {
    await EditorService.createEditor({
      username,
      password: hashedPassword,
      adminId: req.user.id,
    });
    res.sendSuccess({ status: "success", username, password });
  } catch (error) {
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
    res.sendSuccess({ status: "success" });
  } catch (error) {
    res.sendError("Failed to reset password", STATUS_CODES.BAD_REQUEST);
  }
};
