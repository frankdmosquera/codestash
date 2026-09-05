import { z } from "zod";
import { MAX_CHARS_PER_SECTION } from "@/lib/config/plan-limits";

// Generous, plan-independent technical ceilings — not the real limits
// (those are PLAN_LIMITS[plan]'s section/depth counts, checked at runtime
// in the action since Zod can't know which org is submitting), just sanity
// bounds so a malformed or abusive request can't ask the server to insert
// an absurd number of rows, or nest absurdly deep, in one call.
const ABSOLUTE_MAX_SECTIONS = 500;
const ABSOLUTE_MAX_DEPTH_INDEX = 19; // depth is 0-indexed; the highest real plan cap today is 10 (Plan A)

// Sections are a flat list carrying their own nesting depth (0 = top level),
// not a nested structure — the server converts depth into real parentId
// relationships by walking the list with a stack (same shape as
// scripts/lib/markdown-to-manual-sections.ts's heading-level walk, just
// fed an explicit depth instead of counting "#" characters). One section =
// one block still — either a paragraph of text or a single code snippet,
// never both. maxCharsPerSection is the same for every plan (a per-bullet
// legibility ceiling, not a paid feature) so it goes straight into the
// schema; maxNestingDepth now scales by plan (see
// md-docs/ROLES-AND-BILLING-PLAN.md #7), so depth only gets the generous
// absolute ceiling here — the real per-plan bound is enforced in
// manual-actions.ts's assertWithinSectionLimits.
export const manualSectionValidationSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  kind: z.enum(["text", "code"]),
  content: z
    .string()
    .trim()
    .min(1, "Required")
    .max(
      MAX_CHARS_PER_SECTION,
      `Keep it under ${MAX_CHARS_PER_SECTION} characters — split long content into a nested section instead`,
    ),
  depth: z.number().int().min(0).max(ABSOLUTE_MAX_DEPTH_INDEX, "Nested too deep"),
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
