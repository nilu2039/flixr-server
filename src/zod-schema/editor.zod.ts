import { z } from "zod";

export const editorResetPasswordSchema = z.object({
  password: z.string(),
});

export const editorLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type EditorResetPassword = z.infer<typeof editorResetPasswordSchema>;
export type EditorLogin = z.infer<typeof editorLoginSchema>;
