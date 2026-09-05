"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ManualForm } from "./manual-form";
import type { PlanLimits } from "@/lib/config/plan-limits";

// Rendered on the category page for any signed-in member with an active
// org, not just owner/admin — the server action is the real gate (a
// member gets a permission error on submit), same deliberate choice
// CreateCategoryDialog already makes. Precise role-based UI hiding is
// Phase 4 scope. planLimits comes from the caller (a Server Component that
// already resolved the active org), not fetched here — same reasoning as
// EditManualDialog.
export function CreateManualDialog({
  categoryId,
  categoryHref,
  isSnippetShaped,
  planLimits,
}: {
  categoryId: string;
  categoryHref: string;
  isSnippetShaped: boolean;
  planLimits: PlanLimits;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5" />
        }
      >
        <Plus className="size-4" />
        New manual
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New manual</DialogTitle>
        </DialogHeader>
        <ManualForm
          mode="create"
          categoryId={categoryId}
          isSnippetShaped={isSnippetShaped}
          planLimits={planLimits}
          onSuccess={(result) => {
            setOpen(false);
            router.push(`${categoryHref}/${result.slug}`);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
