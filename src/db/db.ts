import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const connection = postgres("");

export const db = drizzle(connection, { logger: true, schema });

export type db = typeof db;

export default db;
