import { z } from "zod";

export const createCategoryValidationSchema = z.object({
  label: z.string().trim().min(1, "Required"),
});

export type CreateCategoryValidationInput = z.infer<
  typeof createCategoryValidationSchema
>;
