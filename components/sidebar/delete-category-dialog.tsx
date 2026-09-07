"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { authClient } from "@/lib/auth-client";
import { deleteCategoryAction } from "@/lib/actions/category-actions";

// Every category can be deleted through the app now — no more curated
// tier to carve an exception out for. Unlike deleting a manual, this has no
// soft-delete: the category and every manual/snippet inside it are gone
// for good, so the copy says so plainly rather than reusing
// DeleteManualDialog's softer "no restore option yet."
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
  const { data: organization } = authClient.useActiveOrganization();
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => deleteCategoryAction(categoryId),
    onSuccess: () => {
      setOpen(false);
      // The sidebar and home grid read this category list from their own
      // React Query cache, not server-rendered data - router.refresh()
      // alone never touches it, leaving a phantom entry pointing at an id
      // that no longer exists until a hard reload (see also
      // EditCategoryDialog, which had the same gap).
      queryClient.invalidateQueries({ queryKey: ["categories", organization?.id] });
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
