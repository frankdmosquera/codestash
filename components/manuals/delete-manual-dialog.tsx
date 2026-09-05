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
import { deleteManualAction } from "@/lib/actions/manual-actions";

// Rendered next to EditManualDialog on both ManualPage and SnippetPage —
// same deliberate "server action is the real gate" choice: this button
// shows for any signed-in member with an active org, deleteManualAction
// itself is what actually enforces owner/admin-only. Soft-delete, so
// there's no real data loss — just navigates back to the category page
// since this manual's own page no longer resolves once deleted.
export function DeleteManualDialog({
  manualId,
  title,
  categorySlug,
}: {
  manualId: string;
  title: string;
  categorySlug: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => deleteManualAction(manualId),
    onSuccess: () => {
      setOpen(false);
      router.push(`/${categorySlug}`);
      router.refresh();
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <Trash2 className="size-4" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{title}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            It&apos;ll disappear from the catalog right away. The data itself isn&apos;t
            permanently erased, but there&apos;s no restore option in the app yet.
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
