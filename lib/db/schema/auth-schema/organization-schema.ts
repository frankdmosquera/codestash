import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull(),
    metadata: text("metadata"),
    // Not enforced anywhere yet — groundwork for a future free-vs-paid
    // category cap. See the additionalFields comment in lib/auth.ts.
    plan: text("plan").default("free").notNull(),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);
