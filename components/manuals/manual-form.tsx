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
import {
  createManualValidationSchema,
  type CreateManualValidationInput,
  type ManualSectionInput,
} from "@/lib/validations/manual-validation";

const emptySection: ManualSectionInput = { title: "", kind: "text", content: "" };

// Split out so `useWatch` (the safe, subscription-based way to read
// another field's live value) has a stable component to attach to —
// calling form.watch() inline during render isn't compiler-memoizable
// and can produce stale UI.
function ManualSectionRow({
  control,
  index,
  onRemove,
  canRemove,
}: {
  control: Control<CreateManualValidationInput>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const kind = useWatch({ control, name: `sections.${index}.kind` });

  return (
    <div className="space-y-2 rounded-lg border border-input p-3">
      <div className="flex items-center gap-2">
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
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  );
}

type ManualFormProps = {
  isSnippetShaped: boolean;
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
  const { isSnippetShaped, onSuccess, mode } = props;

  const defaultValues: CreateManualValidationInput =
    mode === "edit"
      ? {
          categoryId: "",
          title: props.initialTitle,
          subtitle: props.initialSubtitle,
          sections: props.initialSections.length > 0 ? props.initialSections : [emptySection],
        }
      : {
          categoryId: props.categoryId,
          title: "",
          subtitle: "",
          sections: [emptySection],
        };

  const form = useForm<CreateManualValidationInput>({
    resolver: zodResolver(createManualValidationSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sections",
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (values: CreateManualValidationInput) => {
      const sections = isSnippetShaped ? [{ ...values.sections[0], title: values.title }] : values.sections;
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
          <FieldLabel>Sections</FieldLabel>
          {fields.map((sectionField, index) => (
            <ManualSectionRow
              key={sectionField.id}
              control={form.control}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => append(emptySection)}>
            <Plus className="size-4" />
            Add section
          </Button>
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
