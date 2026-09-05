"use client";

import { useState } from "react";
import { Share2, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  shareManualAction,
  revokeManualShareAction,
  getSharesForManual,
} from "@/lib/actions/manual-share-actions";
import {
  shareManualValidationSchema,
  type ShareManualValidationInput,
} from "@/lib/validations/manual-share-validation";

// Rendered on a manual's own page for any signed-in member with an active
// org — same deliberate "server action is the real gate" choice as
// EditManualDialog/DeleteManualDialog: shareManualAction/revokeManualShareAction
// are what actually enforce owner/admin-only.
export function ShareManualDialog({ manualId }: { manualId: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const sharesQueryKey = ["manual-shares", manualId];

  const { data: shares } = useQuery({
    queryKey: sharesQueryKey,
    queryFn: () => getSharesForManual(manualId),
    enabled: open,
  });

  const form = useForm<ShareManualValidationInput>({
    resolver: zodResolver(shareManualValidationSchema),
    defaultValues: { manualId, email: "", permission: "view" },
  });

  const shareMutation = useMutation({
    mutationFn: (values: ShareManualValidationInput) => shareManualAction(values),
    onSuccess: () => {
      form.reset({ manualId, email: "", permission: "view" });
      queryClient.invalidateQueries({ queryKey: sharesQueryKey });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (shareId: string) => revokeManualShareAction(shareId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sharesQueryKey }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <Share2 className="size-4" />
        Share
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share this manual</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => shareMutation.mutate(values))}
          className="flex items-end gap-2"
        >
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="share-email">Email</FieldLabel>
                <Input {...field} id="share-email" type="email" placeholder="someone@example.com" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="permission"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="share-permission">Access</FieldLabel>
                <select
                  {...field}
                  id="share-permission"
                  className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                >
                  <option value="view">Can view</option>
                  <option value="edit">Can edit</option>
                </select>
              </Field>
            )}
          />
          <Button type="submit" disabled={shareMutation.isPending}>
            {shareMutation.isPending ? "Sharing..." : "Share"}
          </Button>
        </form>
        {shareMutation.error && (
          <p className="text-sm text-destructive">{shareMutation.error.message}</p>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {shares && shares.length > 0 ? "Shared with" : "Not shared with anyone yet"}
          </p>
          {shares?.map((share) => (
            <div
              key={share.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-input px-3 py-2 text-sm"
            >
              <span className="truncate">{share.email}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {share.permission === "edit" ? "Can edit" : "Can view"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${share.email}`}
                  disabled={revokeMutation.isPending}
                  onClick={() => revokeMutation.mutate(share.id)}
                >
                  <X className="size-4" />
                </Button>
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
