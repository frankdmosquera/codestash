import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — add it to .env.local");
}

export default defineConfig({
  out: "./lib/db/migrations",
  schema: [
    "./lib/db/schema/auth-schema/index.ts",
    "./lib/db/schema/app-schema/index.ts",
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
