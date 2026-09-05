import { pgTable, text, timestamp, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "../auth-schema";
import { manual } from "./manual-schema";

export const manualSharePermissionEnum = pgEnum("manual_share_permission", ["view", "edit"]);

// Grants a specific email access to exactly one manual, outside the
// organization entirely — no membership, no seat, no visibility into
// anything else in the workspace. Access is granted immediately (no
// pending/accept step like an org invitation) since there's no seat to
// gate: the moment a signed-in session's email matches a row here, that
// person can open this one manual. See lib/actions/manual-share-actions.ts.
export const manualShare = pgTable(
  "manual_share",
  {
    id: text("id").primaryKey(),
    manualId: text("manual_id")
      .notNull()
      .references(() => manual.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    permission: manualSharePermissionEnum("permission").default("view").notNull(),
    invitedByUserId: text("invited_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("manual_share_manualId_idx").on(table.manualId),
    uniqueIndex("manual_share_manual_email_uidx").on(table.manualId, table.email),
  ],
);
