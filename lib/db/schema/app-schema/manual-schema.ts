import { pgTable, text, timestamp, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";
import { organization, user } from "../auth-schema";
import { category } from "./category-schema";

export const visibilityEnum = pgEnum("visibility", ["private", "shared"]);

export const manual = pgTable(
  "manual",
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
    subtitle: text("subtitle"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("manual_organizationId_idx").on(table.organizationId),
    index("manual_categoryId_idx").on(table.categoryId),
    index("manual_ownerId_idx").on(table.ownerId),
    uniqueIndex("manual_org_slug_uidx").on(table.organizationId, table.slug),
  ],
);
