import { relations } from "drizzle-orm";
import { organization, user, member } from "../auth-schema";
import { category } from "./category-schema";
import { manual } from "./manual-schema";
import { section } from "./section-schema";
import { snippet } from "./snippet-schema";
import { memberEditQuota } from "./member-edit-quota-schema";

export const categoryRelations = relations(category, ({ one, many }) => ({
  organization: one(organization, {
    fields: [category.organizationId],
    references: [organization.id],
  }),
  manuals: many(manual),
  snippets: many(snippet),
}));

export const manualRelations = relations(manual, ({ one, many }) => ({
  organization: one(organization, {
    fields: [manual.organizationId],
    references: [organization.id],
  }),
  category: one(category, {
    fields: [manual.categoryId],
    references: [category.id],
  }),
  owner: one(user, {
    fields: [manual.ownerId],
    references: [user.id],
  }),
  sections: many(section),
}));

export const sectionRelations = relations(section, ({ one }) => ({
  manual: one(manual, {
    fields: [section.manualId],
    references: [manual.id],
  }),
}));

export const snippetRelations = relations(snippet, ({ one }) => ({
  organization: one(organization, {
    fields: [snippet.organizationId],
    references: [organization.id],
  }),
  category: one(category, {
    fields: [snippet.categoryId],
    references: [category.id],
  }),
  owner: one(user, {
    fields: [snippet.ownerId],
    references: [user.id],
  }),
}));

export const memberEditQuotaRelations = relations(memberEditQuota, ({ one }) => ({
  member: one(member, {
    fields: [memberEditQuota.memberId],
    references: [member.id],
  }),
}));
