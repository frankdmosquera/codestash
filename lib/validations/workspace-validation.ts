import { z } from "zod";

export const createWorkspaceValidationSchema = z.object({
  name: z.string().trim().min(1, "Required"),
});

export type CreateWorkspaceValidationInput = z.infer<
  typeof createWorkspaceValidationSchema
>;

// "owner" is deliberately not an option here — only the workspace creator
// is owner; invites only ever grant admin (sub-admin) or member (guest editor).
export const inviteMemberValidationSchema = z.object({
  email: z.email(),
  role: z.enum(["admin", "member"]),
});

export type InviteMemberValidationInput = z.infer<
  typeof inviteMemberValidationSchema
>;
