"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCategoryAction } from "@/lib/actions/category-actions";

// Only ever rendered for a genuinely custom, DB-only category (see the
// [category]/page.tsx branch with no static `getCategoryBySlug` match) —
// deleteCategoryAction itself refuses a curated category as a second gate,
// same "server action is the real gate" pattern as DeleteManualDialog.
// Unlike deleting a manual, this has no soft-delete: the category and every
// manual/snippet inside it are gone for good, so the copy says so plainly
// rather than reusing DeleteManualDialog's softer "no restore option yet."
export function DeleteCategoryDialog({
  categoryId,
  label,
  itemCount,
}: {
  categoryId: string;
  label: string;
  itemCount: number;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => deleteCategoryAction(categoryId),
    onSuccess: () => {
      setOpen(false);
      router.push("/");
      router.refresh();
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <Trash2 className="size-4" />
        Delete category
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{label}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            {itemCount > 0
              ? `This permanently deletes the category and everything inside it — ${itemCount} item${itemCount === 1 ? "" : "s"}. This cannot be undone.`
              : "This permanently deletes the category. This cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error.message}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={() => mutate()}>
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
