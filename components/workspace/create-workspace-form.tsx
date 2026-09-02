"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { slugify } from "@/lib/utils";
import {
  createWorkspaceValidationSchema,
  type CreateWorkspaceValidationInput,
} from "@/lib/validations/workspace-validation";

export function CreateWorkspaceForm() {
  const router = useRouter();

  const form = useForm<CreateWorkspaceValidationInput>({
    resolver: zodResolver(createWorkspaceValidationSchema),
    defaultValues: { name: "" },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (values: CreateWorkspaceValidationInput) => {
      const { data, error } = await authClient.organization.create({
        name: values.name,
        slug: slugify(values.name),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your workspace</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((values) => mutate(values))}
          className="space-y-4"
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="workspace-name">
                  Workspace name
                </FieldLabel>
                <Input
                  {...field}
                  id="workspace-name"
                  placeholder="e.g. My Family"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {error && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? "Creating..." : "Create workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
