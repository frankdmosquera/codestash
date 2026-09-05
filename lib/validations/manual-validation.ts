import { z } from "zod";

// One section = one block for v1 — either a paragraph of text or a single
// code snippet, never both, never nested. Matches the flat, plain-textarea
// scope locked for the create/edit form (see md-docs/roadmap/03-core-product.md);
// richer per-section content (lists, multiple blocks, nesting) is later work.
export const manualSectionValidationSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  kind: z.enum(["text", "code"]),
  content: z.string().trim().min(1, "Required"),
});

export type ManualSectionInput = z.infer<typeof manualSectionValidationSchema>;

export const createManualValidationSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(1, "Required"),
  subtitle: z.string().trim().optional(),
  sections: z.array(manualSectionValidationSchema).min(1, "At least one section is required"),
});

export type CreateManualValidationInput = z.infer<typeof createManualValidationSchema>;

export const updateManualValidationSchema = z.object({
  manualId: z.string().min(1),
  title: z.string().trim().min(1, "Required"),
  subtitle: z.string().trim().optional(),
  sections: z.array(manualSectionValidationSchema).min(1, "At least one section is required"),
});

export type UpdateManualValidationInput = z.infer<typeof updateManualValidationSchema>;
