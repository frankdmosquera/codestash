import { pgTable, text, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { manual } from "./manual-schema";

// Sections form a tree via parentId. Order within siblings is a
// fractional/lexicographic rank (e.g. "a0", "a1", "a2" ...), never a
// stored "2.3" — the dotted display number is computed by walking the
// tree ordered by rank, so inserting or reordering never touches
// sibling rows. See mastering-git.ts's `number` field for the static
// equivalent this table replaces.
export const section = pgTable(
  "section",
  {
    id: text("id").primaryKey(),
    manualId: text("manual_id")
      .notNull()
      .references(() => manual.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    rank: text("rank").notNull(),
    title: text("title").notNull(),
    // ContentBlock[] from lib/data/types.ts — { type: "p" | "list" | "code" | "note", ... }
    blocks: jsonb("blocks").notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("section_manualId_idx").on(table.manualId),
    index("section_parentId_idx").on(table.parentId),
    uniqueIndex("section_parent_rank_uidx").on(table.parentId, table.rank),
  ],
);
