"use client";

import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { createManualAction, updateManualAction } from "@/lib/actions/manual-actions";
import { CONTENT_STRUCTURE_LIMITS, type PlanLimits } from "@/lib/config/plan-limits";
import { cn } from "@/lib/utils";
import {
  createManualValidationSchema,
  type CreateManualValidationInput,
  type ManualSectionInput,
} from "@/lib/validations/manual-validation";

const emptySection = (depth: number): ManualSectionInput => ({ title: "", kind: "text", content: "", depth });

const MAX_DEPTH_INDEX = CONTENT_STRUCTURE_LIMITS.maxNestingDepth - 1; // depth is 0-indexed
const MAX_CHARS = CONTENT_STRUCTURE_LIMITS.maxCharsPerSection;

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

// Split out so `useWatch` (the safe, subscription-based way to read
// another field's live value) has a stable component to attach to —
// calling form.watch() inline during render isn't compiler-memoizable
// and can produce stale UI.
function ManualSectionRow({
  control,
  index,
  number,
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
      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">{number}</span>
        <Controller
          name={`sections.${index}.title`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="flex-1">
              <Input {...field} placeholder="Section title" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name={`sections.${index}.kind`}
          control={control}
          render={({ field }) => (
            <select {...field} className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm">
              <option value="text">Text</option>
              <option value="code">Code</option>
            </select>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Outdent (move up a level)"
          disabled={!canOutdent}
          onClick={onOutdent}
        >
          Outdent
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Indent (nest under the section above)"
          disabled={!canIndent}
          onClick={onIndent}
        >
          Indent
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
            <div className="flex items-center justify-between">
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <span />
              )}
              <span
                className={cn(
                  "text-xs tabular-nums text-muted-foreground",
                  field.value.length > MAX_CHARS && "text-destructive",
                )}
              >
                {field.value.length} / {MAX_CHARS}
              </span>
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

  const defaultValues: CreateManualValidationInput =
    mode === "edit"
      ? {
          categoryId: "",
          title: props.initialTitle,
          subtitle: props.initialSubtitle,
          sections: props.initialSections.length > 0 ? props.initialSections : [emptySection(0)],
        }
      : {
          categoryId: props.categoryId,
          title: "",
          subtitle: "",
          sections: [emptySection(0)],
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

  const maxSections = planLimits.maxSectionsPerManual;
  const atSectionLimit = maxSections !== null && fields.length >= maxSections;

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
          <div className="flex items-center justify-between">
            <FieldLabel>Sections</FieldLabel>
            <span className="text-xs tabular-nums text-muted-foreground">
              {fields.length}{maxSections !== null ? ` / ${maxSections}` : ""} sections
            </span>
          </div>
          {fields.map((sectionField, index) => {
            const depth = depths[index] ?? 0;
            const previousDepth = index > 0 ? (depths[index - 1] ?? 0) : -1;
            const canIndent = index > 0 && depth < previousDepth + 1 && depth < MAX_DEPTH_INDEX;
            const canOutdent = depth > 0;
            return (
              <ManualSectionRow
                key={sectionField.id}
                control={form.control}
                index={index}
                number={numbers[index] ?? ""}
                canIndent={canIndent}
                canOutdent={canOutdent}
                onIndent={() => form.setValue(`sections.${index}.depth`, depth + 1)}
                onOutdent={() => form.setValue(`sections.${index}.depth`, depth - 1)}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            );
          })}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={atSectionLimit}
              onClick={() => append(emptySection(depths.at(-1) ?? 0))}
            >
              <Plus className="size-4" />
              Add section
            </Button>
            {atSectionLimit && (
              <span className="text-xs text-muted-foreground">
                This plan allows up to {maxSections} sections per manual
              </span>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
