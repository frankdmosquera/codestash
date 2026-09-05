import { z } from "zod";
import { CONTENT_STRUCTURE_LIMITS } from "@/lib/config/plan-limits";

// A generous, plan-independent technical ceiling — not the real limit (that's
// PLAN_LIMITS[plan].maxSectionsPerManual, checked at runtime in the action
// since Zod can't know which org is submitting), just a sanity bound so a
// malformed or abusive request can't ask the server to insert an absurd
// number of rows in one call.
const ABSOLUTE_MAX_SECTIONS = 500;

// Sections are a flat list carrying their own nesting depth (0 = top level),
// not a nested structure — the server converts depth into real parentId
// relationships by walking the list with a stack (same shape as
// scripts/lib/markdown-to-manual-sections.ts's heading-level walk, just
// fed an explicit depth instead of counting "#" characters). One section =
// one block still — either a paragraph of text or a single code snippet,
// never both. maxNestingDepth/maxCharsPerSection are the same for every
// plan (legibility/render-performance ceilings, not a paid feature) so they
// go straight into the schema; see md-docs/ROLES-AND-BILLING-PLAN.md #7.
export const manualSectionValidationSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  kind: z.enum(["text", "code"]),
  content: z
    .string()
    .trim()
    .min(1, "Required")
    .max(
      CONTENT_STRUCTURE_LIMITS.maxCharsPerSection,
      `Keep it under ${CONTENT_STRUCTURE_LIMITS.maxCharsPerSection} characters — split long content into a nested section instead`,
    ),
  depth: z
    .number()
    .int()
    .min(0)
    .max(CONTENT_STRUCTURE_LIMITS.maxNestingDepth - 1, "Nested too deep"),
});

export type ManualSectionInput = z.infer<typeof manualSectionValidationSchema>;

export const createManualValidationSchema = z.object({
  // No .min(1) here on purpose — this schema is also the edit-form resolver
  // (see manual-form.tsx), where categoryId is never a real user-entered
  // field and defaults to "". createManualAction re-validates a real
  // categoryId server-side regardless (it looks the row up and throws if
  // missing), so this stays a client-side convenience, not the real gate.
  categoryId: z.string(),
  title: z.string().trim().min(1, "Required"),
  subtitle: z.string().trim().optional(),
  sections: z
    .array(manualSectionValidationSchema)
    .min(1, "At least one section is required")
    .max(ABSOLUTE_MAX_SECTIONS),
});

export type CreateManualValidationInput = z.infer<typeof createManualValidationSchema>;

export const updateManualValidationSchema = z.object({
  manualId: z.string().min(1),
  title: z.string().trim().min(1, "Required"),
  subtitle: z.string().trim().optional(),
  sections: z
    .array(manualSectionValidationSchema)
    .min(1, "At least one section is required")
    .max(ABSOLUTE_MAX_SECTIONS),
});

export type UpdateManualValidationInput = z.infer<typeof updateManualValidationSchema>;
