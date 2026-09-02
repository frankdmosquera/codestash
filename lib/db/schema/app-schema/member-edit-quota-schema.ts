import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { member } from "../auth-schema";

// Enforces the "non-paying guest can edit up to 5 records, can't invite
// anyone" rule for organization role "member". One row per member; a
// separate table (rather than extra columns on the generated `member`
// table in schema/auth-schema/) so regenerating that folder never wipes this.
export const memberEditQuota = pgTable("member_edit_quota", {
  memberId: text("member_id")
    .primaryKey()
    .references(() => member.id, { onDelete: "cascade" }),
  editLimit: integer("edit_limit").default(5).notNull(),
  editCount: integer("edit_count").default(0).notNull(),
});
