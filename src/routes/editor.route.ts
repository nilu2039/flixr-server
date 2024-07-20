import { Router } from "express";
import {
  createEditor,
  resetEditorPassword,
} from "../controller/editor.controller";
import { isAdmin, isEditor } from "../middleware/auth.middleware";
import { validatePostBody } from "../middleware/validate.middleware";
import { editorResetPasswordSchema } from "../zod-schema/editor.zod";

const router = Router();

router.post("/create-editor", isAdmin, createEditor);
router.post(
  "/reset-editor-password",
  isEditor,
  validatePostBody(editorResetPasswordSchema),
  resetEditorPassword
);

export default router;