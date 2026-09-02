import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as authSchema from "./schema/auth-schema";
import * as appSchema from "./schema/app-schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — add it to .env.local");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, {
  schema: { ...authSchema, ...appSchema },
});
