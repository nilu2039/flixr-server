import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import EditorService from "../service/editor.service";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const editor = await EditorService.getEditorByUsername(username);
      if (!editor) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (!(await EditorService.verifyPassword(username, password))) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, { id: editor.id, role: editor.role as "editor" });
    } catch (error) {
      done(error, false);
    }
  })
);

passport.serializeUser((user: Express.User, done) => {
  const _user: Express.User = {
    id: user.id,
    role: user.role,
  };
  done(null, _user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user as Express.User);
});
