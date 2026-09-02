import { pgTable, text, index, uniqueIndex, timestamp } from "drizzle-orm/pg-core";
import { organization } from "../auth-schema";

// Replaces the old hardcoded lib/constants/categories.ts — each workspace
// creates and orders its own categories (manuals, hooks, ... or anything
// else). `icon` is a lucide-react icon name (validated against a curated
// allowlist in app code, not at the DB level) and `backgroundTheme` a key
// into a small set of preset themes — neither is a free-form value users
// can inject arbitrary content into.
export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    description: text("description"),
    icon: text("icon").notNull().default("BookOpen"),
    backgroundTheme: text("background_theme").notNull().default("default"),
    // Fractional-indexing rank (see lib/db/schema/app-schema/section-schema.ts
    // for the same pattern) — sidebar drag-and-drop reorders by changing
    // just this column, never a stored position number.
    rank: text("rank").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("category_organizationId_idx").on(table.organizationId),
    uniqueIndex("category_org_slug_uidx").on(table.organizationId, table.slug),
  ],
);
