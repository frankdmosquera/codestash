"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ManualForm } from "./manual-form";
import type { ManualSectionInput } from "@/lib/validations/manual-validation";
import type { PlanLimits } from "@/lib/config/plan-limits";

// Rendered on a manual's own page for any signed-in member with an active
// org — same deliberate "server action is the real gate" choice as
// CreateManualDialog/CreateCategoryDialog. Precise role-based UI hiding is
// Phase 4 scope. planLimits is resolved by the caller (a Server Component
// that already knows the manual's owning org) rather than fetched here —
// this component is also used from the shared-doc route, where the
// current viewer may have no org of their own at all, so the limit has to
// come from the manual's org, not "whatever getActiveOrganization() finds."
export function EditManualDialog({
  manualId,
  initialTitle,
  initialSubtitle,
  initialSections,
  isSnippetShaped,
  planLimits,
}: {
  manualId: string;
  initialTitle: string;
  initialSubtitle: string;
  initialSections: ManualSectionInput[];
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
        <Pencil className="size-4" />
        Edit
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit manual</DialogTitle>
        </DialogHeader>
        <ManualForm
          mode="edit"
          manualId={manualId}
          initialTitle={initialTitle}
          initialSubtitle={initialSubtitle}
          initialSections={initialSections}
          isSnippetShaped={isSnippetShaped}
          planLimits={planLimits}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
