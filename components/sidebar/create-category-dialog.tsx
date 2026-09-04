"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { createCategoryAction } from "@/lib/actions/category-actions";
import {
  createCategoryValidationSchema,
  type CreateCategoryValidationInput,
} from "@/lib/validations/category-validation";

// Minimal by design — name only. Icon/background stay at the schema's
// default until the icon/theme picker (future work, see
// md-docs/roadmap/03-core-product.md) exists. Rendered for any signed-in
// member with an active org, not just owner/admin — the server action is
// the real gate (member gets a permission error on submit). Precise
// role-based UI (hiding this entirely from members) is Phase 4 scope.
export function CreateCategoryDialog({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateCategoryValidationInput>({
    resolver: zodResolver(createCategoryValidationSchema),
    defaultValues: { label: "" },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: createCategoryAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", organizationId] });
      form.reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Add category"
            className="text-neutral-500 hover:bg-neutral-800 hover:text-white"
          />
        }
      >
        <Plus className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((values) => mutate(values))}
          className="space-y-4"
        >
          <Controller
            name="label"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="category-label">Name</FieldLabel>
                <Input
                  {...field}
                  id="category-label"
                  placeholder="e.g. Design Patterns"
                  aria-invalid={fieldState.invalid}
                  autoFocus
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {error && <p className="text-sm text-destructive">{error.message}</p>}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
