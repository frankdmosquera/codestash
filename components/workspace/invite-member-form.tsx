"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import {
  inviteMemberValidationSchema,
  type InviteMemberValidationInput,
} from "@/lib/validations/workspace-validation";

export function InviteMemberForm() {
  const form = useForm<InviteMemberValidationInput>({
    resolver: zodResolver(inviteMemberValidationSchema),
    defaultValues: { email: "", role: "member" },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (values: InviteMemberValidationInput) => {
      const { data, error } = await authClient.organization.inviteMember(values);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // No manual refetch needed — Better Auth's own client reactively
      // refreshes useActiveOrganization() whenever an /organization/* call
      // succeeds (it's nanostores-based, separate from our React Query).
      form.reset();
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutate(values))}
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="flex-1">
            <FieldLabel htmlFor="invite-email">Email</FieldLabel>
            <Input
              {...field}
              id="invite-email"
              type="email"
              placeholder="teammate@example.com"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="role"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="invite-role">Role</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="invite-role" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Inviting..." : "Invite"}
      </Button>
    </form>
  );
}
