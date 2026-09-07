"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

const renameOrgSchema = z.object({ name: z.string().trim().min(1, "Required") });
type RenameOrgInput = z.infer<typeof renameOrgSchema>;

// Scoped to just the name, same "minimal by design" reasoning as
// CreateCategoryDialog/EditCategoryDialog - slug is left untouched even
// though better-auth's update endpoint would allow changing it, since
// nothing here needs that and it's a bigger, separate risk (any link that
// happens to embed the org slug would break). Permission (organization:
// ["update"], owner has it per lib/auth.ts's orgOwnerAcNoDelete) is
// enforced by better-auth itself - the real gate, same as everywhere else.
export function EditOrganizationNameDialog({
  organizationId,
  initialName,
}: {
  organizationId: string;
  initialName: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<RenameOrgInput>({
    resolver: zodResolver(renameOrgSchema),
    defaultValues: { name: initialName },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (values: RenameOrgInput) => {
      const { data, error } = await authClient.organization.update({
        organizationId,
        data: { name: values.name },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setOpen(false);
      router.refresh();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Rename workspace" />}>
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((values) => mutate(values))} className="space-y-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="org-name">Name</FieldLabel>
                <Input {...field} id="org-name" aria-invalid={fieldState.invalid} autoFocus />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {error && <p className="text-sm text-destructive">{error.message}</p>}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
