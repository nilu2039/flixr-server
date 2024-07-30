import { eq, or } from "drizzle-orm";
import db from "../db/db";
import argon2 from "argon2";
import { editors, EditorsInsertType, Editor } from "../db/schema";

const EditorService = {
  async createEditor(data: EditorsInsertType) {
    try {
      await db.insert(editors).values(data);
    } catch (error) {
      throw error;
    }
  },

  async updateEditorById(editorId: number, data: Partial<EditorsInsertType>) {
    try {
      await db.update(editors).set(data).where(eq(editors.id, editorId));
    } catch (error) {
      throw error;
    }
  },

  async getEditorById(
    editorId: number,
    columns?: Partial<Record<keyof Editor, boolean>>
  ) {
    try {
      return await db.query.editors.findFirst({
        where: eq(editors.id, editorId),
        with: {
          admin: { columns: { ytChannelName: true } },
        },
        ...(columns ? { columns } : {}),
      });
    } catch (error) {
      throw error;
    }
  },

  async getEditor({ username }: { username: string }) {
    try {
      return await db.query.editors.findFirst({
        where: or(eq(editors.username, username), eq(editors.email, username)),
      });
    } catch (error) {
      throw error;
    }
  },

  async verifyPassword(username: string, password: string) {
    try {
      const editor = await db.query.editors.findFirst({
        where: or(eq(editors.username, username), eq(editors.email, username)),
      });
      if (!editor) {
        return false;
      }
      return await argon2.verify(editor.password, password);
    } catch (error) {
      throw error;
    }
  },
};

export default EditorService;
