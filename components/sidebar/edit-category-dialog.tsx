"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";
import { updateCategoryAction } from "@/lib/actions/category-actions";
import {
  createCategoryValidationSchema,
  type CreateCategoryValidationInput,
} from "@/lib/validations/category-validation";

// Only ever rendered for a genuinely custom, DB-only category (same
// [category]/page.tsx branch as DeleteCategoryDialog) — updateCategoryAction
// itself refuses a curated category as the real gate. Renaming never
// changes the category's slug/URL, same reasoning as EditManualDialog.
export function EditCategoryDialog({
  categoryId,
  initialLabel,
}: {
  categoryId: string;
  initialLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: organization } = authClient.useActiveOrganization();
  const queryClient = useQueryClient();

  const form = useForm<CreateCategoryValidationInput>({
    resolver: zodResolver(createCategoryValidationSchema),
    defaultValues: { label: initialLabel },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (values: CreateCategoryValidationInput) => updateCategoryAction(categoryId, values),
    onSuccess: () => {
      setOpen(false);
      // Same cache gap as DeleteCategoryDialog: the sidebar/home grid read
      // this from React Query, which router.refresh() never touches.
      queryClient.invalidateQueries({ queryKey: ["categories", organization?.id] });
      router.refresh();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <Pencil className="size-4" />
        Edit
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename category</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((values) => mutate(values))} className="space-y-4">
          <Controller
            name="label"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="category-edit-label">Name</FieldLabel>
                <Input
                  {...field}
                  id="category-edit-label"
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
