import { pgTable, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { organization, user } from "../auth-schema";
import { category } from "./category-schema";
import { visibilityEnum } from "./manual-schema";

// Shared table for hooks, helpers, blocks, and AI instructions — all four
// are the same shape ("one piece of copy-pasteable code with a title"), see
// lib/data/types.ts's Snippet type. Which category a row belongs to is just
// its categoryId, same as manual.
export const snippet = pgTable(
  "snippet",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    visibility: visibilityEnum("visibility").default("private").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    code: text("code").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("snippet_organizationId_idx").on(table.organizationId),
    index("snippet_categoryId_idx").on(table.categoryId),
    index("snippet_ownerId_idx").on(table.ownerId),
    uniqueIndex("snippet_org_slug_uidx").on(table.organizationId, table.slug),
  ],
);
