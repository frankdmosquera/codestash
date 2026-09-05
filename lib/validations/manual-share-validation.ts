import { z } from "zod";

export const shareManualValidationSchema = z.object({
  manualId: z.string().min(1),
  email: z.string().trim().min(1, "Required").email("Enter a valid email"),
  permission: z.enum(["view", "edit"]),
});

export type ShareManualValidationInput = z.infer<typeof shareManualValidationSchema>;
