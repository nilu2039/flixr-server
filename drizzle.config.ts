import { defineConfig } from "drizzle-kit";
import "dotenv/config";
import env from "./src/env";
console.log("env.DATABASE_URL", env.DATABASE_URL);
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
