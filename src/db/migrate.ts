import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import env from "../env";

const main = async () => {
  const connection = postgres(env.DATABASE_URL, { max: 1 });

  const db = drizzle(connection);

  // This will run migrations on the database, skipping the ones already applied
  await migrate(db, { migrationsFolder: "./src/db/migrations" });

  // Don't forget to close the connection, otherwise the script will hang
  await connection.end();
};

main();
