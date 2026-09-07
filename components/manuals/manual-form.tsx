"use client";

import { IndentDecrease, IndentIncrease, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { createManualAction, updateManualAction } from "@/lib/actions/manual-actions";
import { MAX_CHARS_PER_SECTION, type PlanLimits } from "@/lib/config/plan-limits";
import { cn } from "@/lib/utils";
import {
  createManualValidationSchema,
  type CreateManualValidationInput,
  type ManualSectionInput,
} from "@/lib/validations/manual-validation";

const emptySection = (depth: number): ManualSectionInput => ({ title: "", kind: "text", content: "", depth });

// A snippet's single section has no title field in the UI at all (see
// ManualForm's isSnippetShaped branch) — its title always comes from the
// manual's own title instead, overridden right before submit (see the
// mutationFn below). But react-hook-form validates the *current* form
// state before that override runs, and manualSectionValidationSchema
// requires every section's title to be non-empty — so without a seeded
// placeholder here, create-mode validation fails on a field the user can
// never see or fill in, and the form silently refuses to submit. `kind`
// must also start as "code", matching how SnippetPage's EditManualDialog
// always seeds it (see components/snippet-page.tsx) — a snippet is always
// a code block, never a text paragraph.
const emptySnippetSection = (depth: number): ManualSectionInput => ({
  title: "snippet",
  kind: "code",
  content: "",
  depth,
});

const MAX_CHARS = MAX_CHARS_PER_SECTION;

// How many rows sit nested under this one, walking forward while depth
// stays greater than the row's own — used to warn before a removal that
// would silently take a whole subtree with it, not just the one row.
function countDescendants(index: number, depths: number[]): number {
  const depth = depths[index] ?? 0;
  let count = 0;
  for (let i = index + 1; i < depths.length && (depths[i] ?? 0) > depth; i++) {
    count++;
  }
  return count;
}

// Dotted numbering ("1", "1.1", "1.2", "2", ...) computed live from each
// row's depth, the same way buildSectionTree computes it server-side for
// display — never stored, so it's always correct as rows are added,
// removed, or re-indented.
function computeSectionNumbers(depths: number[]): string[] {
  const counters: number[] = [];
  return depths.map((depth) => {
    counters.length = depth + 1;
    counters[depth] = (counters[depth] ?? 0) + 1;
    return counters.slice(0, depth + 1).join(".");
  });
}

// A real traffic light — green while there's plenty of room, amber once
// you're closing in on a cap, red once you're at (or over) it. A limit
// you see coming rather than one you just hit. Used for every meter in
// this form (section counts, character counts), same thresholds either way.
function meterTone(ratio: number): { bar: string; text: string } {
  if (ratio >= 1) return { bar: "bg-destructive", text: "text-destructive" };
  if (ratio >= 0.8) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-green-500", text: "text-green-600 dark:text-green-400" };
}

// Hand-rolled rather than components/ui/progress.tsx's Progress wrapper —
// that component hardcodes its own ProgressIndicator internally with no
// way to pass a className through for the graduated green/amber/red
// coloring this needs. Same visual language (rounded-full, bg-muted
// track) so it still reads as "the app's progress bar," just built by
// hand for the one thing the wrapper doesn't expose, and sized up from a
// first pass that was too subtle to notice at a glance.
function Meter({ ratio, className }: { ratio: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, ratio * 100));
  return (
    <div className={cn("h-2.5 shrink-0 overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full transition-all", meterTone(ratio).bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Split out so `useWatch` (the safe, subscription-based way to read
// another field's live value) has a stable component to attach to —
// calling form.watch() inline during render isn't compiler-memoizable
// and can produce stale UI.
function ManualSectionRow({
  control,
  index,
  number,
  maxNestingDepth,
  canIndent,
  canOutdent,
  onIndent,
  onOutdent,
  onRemove,
  canRemove,
}: {
  control: Control<CreateManualValidationInput>;
  index: number;
  number: string;
  maxNestingDepth: number;
  canIndent: boolean;
  canOutdent: boolean;
  onIndent: () => void;
  onOutdent: () => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const kind = useWatch({ control, name: `sections.${index}.kind` });
  const depth = useWatch({ control, name: `sections.${index}.depth` });

  return (
    <div className="space-y-2 rounded-lg border border-input p-3" style={{ marginLeft: depth * 20 }}>
      <div className="flex flex-wrap items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="w-8 shrink-0 cursor-default text-xs tabular-nums text-muted-foreground" />
            }
          >
            {number}
          </TooltipTrigger>
          <TooltipContent>
            Nested {depth + 1} of {maxNestingDepth} levels
          </TooltipContent>
        </Tooltip>
        <Controller
          name={`sections.${index}.title`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="min-w-40 flex-1">
              <Input {...field} placeholder="Section title" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`sections.${index}.kind`}
          control={control}
          render={({ field }) => (
            <select {...field} className="h-9 shrink-0 rounded-lg border border-input bg-transparent px-2 text-sm">
              <option value="text">Text</option>
              <option value="code">Code</option>
            </select>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-red-600 hover:bg-red-500/10 hover:text-red-700 disabled:text-muted-foreground dark:text-red-400 dark:hover:text-red-300"
          aria-label="Outdent (move up a level)"
          disabled={!canOutdent}
          onClick={onOutdent}
        >
          <IndentDecrease className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-green-600 hover:bg-green-500/10 hover:text-green-700 disabled:text-muted-foreground dark:text-green-400 dark:hover:text-green-300"
          aria-label="Indent (nest under the section above)"
          disabled={!canIndent}
          onClick={onIndent}
        >
          <IndentIncrease className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove section"
          disabled={!canRemove}
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <Controller
        name={`sections.${index}.content`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Textarea
              {...field}
              placeholder="Paste your text or code here"
              className={kind === "code" ? "min-h-32 font-mono text-sm" : "min-h-24"}
            />
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <span />
              )}
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <Meter ratio={field.value.length / MAX_CHARS} className="w-20" />
                <span className={cn("text-xs tabular-nums", meterTone(field.value.length / MAX_CHARS).text)}>
                  {field.value.length} / {MAX_CHARS}
                </span>
              </div>
            </div>
          </Field>
        )}
      />
    </div>
  );
}

type ManualFormProps = {
  isSnippetShaped: boolean;
  planLimits: PlanLimits;
  onSuccess: (result: { id: string; slug: string }) => void;
} & (
  | { mode: "create"; categoryId: string }
  | {
      mode: "edit";
      manualId: string;
      initialTitle: string;
      initialSubtitle: string;
      initialSections: ManualSectionInput[];
    }
);

// Shared by CreateManualDialog and EditManualDialog — everything about the
// form itself (fields, validation, the create-vs-edit action call) lives
// here; each caller owns its own Dialog/DialogTrigger shell, since the two
// triggers look nothing alike (a small "+" vs. a labeled "Edit" button).
export function ManualForm(props: ManualFormProps) {
  const { isSnippetShaped, planLimits, onSuccess, mode } = props;

  const emptyFirstSection = isSnippetShaped ? emptySnippetSection(0) : emptySection(0);

  const defaultValues: CreateManualValidationInput =
    mode === "edit"
      ? {
          categoryId: "",
          title: props.initialTitle,
          subtitle: props.initialSubtitle,
          sections: props.initialSections.length > 0 ? props.initialSections : [emptyFirstSection],
        }
      : {
          categoryId: props.categoryId,
          title: "",
          subtitle: "",
          sections: [emptyFirstSection],
        };

  const form = useForm<CreateManualValidationInput>({
    resolver: zodResolver(createManualValidationSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const watchedSections = useWatch({ control: form.control, name: "sections" });
  const depths = watchedSections?.map((s) => s.depth ?? 0) ?? [];
  const numbers = computeSectionNumbers(depths);

  // Independent on purpose (see plan-limits.ts) — nesting deeper never
  // costs top-level breadth. mainCount only counts depth-0 rows;
  // fields.length (used for the total check) counts every row.
  const mainCount = depths.filter((d) => d === 0).length;
  const maxMain = planLimits.maxMainSectionsPerManual;
  const maxTotal = planLimits.maxTotalSectionsPerManual;
  const atMainLimit = maxMain !== null && mainCount >= maxMain;
  const atTotalLimit = maxTotal !== null && fields.length >= maxTotal;

  // "Add section" inherits the last row's depth (see the append() call
  // below) — only actually costs a main-bullet slot when that depth is 0.
  const nextAddDepth = depths.at(-1) ?? 0;
  const addBlockedByMain = nextAddDepth === 0 && atMainLimit;
  const addDisabled = atTotalLimit || addBlockedByMain;

  // The aggregate flexibility on top of MAX_CHARS_PER_SECTION's fixed
  // per-bullet ceiling — some bullets can run longer than others, up to
  // this shared budget, rather than every bullet being capped the same.
  const totalChars = watchedSections?.reduce((sum, s) => sum + (s.content?.length ?? 0), 0) ?? 0;
  const maxTotalChars = planLimits.maxTotalCharsPerManual;
  const atTotalCharsLimit = maxTotalChars !== null && totalChars > maxTotalChars;

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (values: CreateManualValidationInput) => {
      const sections = isSnippetShaped
        ? [{ ...values.sections[0], title: values.title, depth: 0 }]
        : values.sections;
      if (mode === "edit") {
        return updateManualAction({
          manualId: props.manualId,
          title: values.title,
          subtitle: values.subtitle,
          sections,
        });
      }
      return createManualAction({ ...values, sections });
    },
    onSuccess,
  });

  return (
    <TooltipProvider>
    <form onSubmit={form.handleSubmit((values) => mutate(values))} className="space-y-4">
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="manual-title">Title</FieldLabel>
            <Input {...field} id="manual-title" placeholder="e.g. Mastering Git" autoFocus />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="subtitle"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="manual-subtitle">Subtitle (optional)</FieldLabel>
            <Input {...field} id="manual-subtitle" placeholder="One line describing it" />
          </Field>
        )}
      />

      {isSnippetShaped ? (
        <Controller
          name="sections.0.content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="manual-code">Code</FieldLabel>
              <Textarea
                {...field}
                id="manual-code"
                placeholder="Paste your code here"
                className="min-h-40 font-mono text-sm"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FieldLabel>Sections</FieldLabel>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-2">
                {maxMain !== null && <Meter ratio={mainCount / maxMain} className="w-16" />}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    maxMain !== null ? meterTone(mainCount / maxMain).text : "text-muted-foreground",
                  )}
                >
                  {mainCount}{maxMain !== null ? `/${maxMain}` : ""} sections
                </span>
              </div>
              <div className="flex items-center gap-2">
                {maxTotal !== null && <Meter ratio={fields.length / maxTotal} className="w-16" />}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    maxTotal !== null ? meterTone(fields.length / maxTotal).text : "text-muted-foreground",
                  )}
                >
                  {fields.length}{maxTotal !== null ? `/${maxTotal}` : ""} bullets
                </span>
              </div>
              <div className="flex items-center gap-2">
                {maxTotalChars !== null && <Meter ratio={totalChars / maxTotalChars} className="w-16" />}
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    maxTotalChars !== null ? meterTone(totalChars / maxTotalChars).text : "text-muted-foreground",
                  )}
                >
                  {totalChars.toLocaleString()}{maxTotalChars !== null ? `/${maxTotalChars.toLocaleString()}` : ""} chars
                </span>
              </div>
            </div>
          </div>
          {fields.map((sectionField, index) => {
            const depth = depths[index] ?? 0;
            const previousDepth = index > 0 ? (depths[index - 1] ?? 0) : -1;
            const canIndent =
              index > 0 && depth < previousDepth + 1 && depth < planLimits.maxNestingDepth - 1;
            const outdentBlockedByMain = depth === 1 && atMainLimit;
            const canOutdent = depth > 0 && !outdentBlockedByMain;
            return (
              <ManualSectionRow
                key={sectionField.id}
                control={form.control}
                index={index}
                number={numbers[index] ?? ""}
                maxNestingDepth={planLimits.maxNestingDepth}
                canIndent={canIndent}
                canOutdent={canOutdent}
                onIndent={() => form.setValue(`sections.${index}.depth`, depth + 1)}
                onOutdent={() => form.setValue(`sections.${index}.depth`, depth - 1)}
                onRemove={() => {
                  const descendantCount = countDescendants(index, depths);
                  if (descendantCount > 0) {
                    const ok = window.confirm(
                      `This section has ${descendantCount} nested item${descendantCount === 1 ? "" : "s"} under it. Delete it and everything nested inside?`,
                    );
                    if (!ok) return;
                    remove(Array.from({ length: descendantCount + 1 }, (_, i) => index + i));
                  } else {
                    remove(index);
                  }
                }}
                canRemove={fields.length > 1}
              />
            );
          })}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={addDisabled}
              onClick={() => append(emptySection(nextAddDepth))}
            >
              <Plus className="size-4" />
              Add section
            </Button>
            {addDisabled && (
              <span className="text-xs text-muted-foreground">
                {atTotalLimit
                  ? `This plan allows up to ${maxTotal} bullets total`
                  : `This plan allows up to ${maxMain} sections — nest under an existing one instead`}
              </span>
            )}
          </div>
        </div>
      )}

      {atTotalCharsLimit && !isSnippetShaped && (
        <p className="text-sm text-destructive">
          This plan allows up to {maxTotalChars?.toLocaleString()} characters total per manual — trim some
          content before saving.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit" disabled={isPending || atTotalCharsLimit}>
          {isPending ? "Saving..." : mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogFooter>
    </form>
    </TooltipProvider>
  );
}
