"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import type { Group, GroupKind } from "@/domain/types";
import { saveGroupAction } from "@/server/actions/workspace";
import { useMutation } from "@/components/shared/feedback";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button, DialogFrame, Field } from "@/components/ui/primitives";
import { Confirmation } from "@/components/ui/confirmation";

export function GroupEditor({ kind, group, onClose, onSaved, nested = false }: {
  kind: GroupKind; group?: Group; onClose: () => void; onSaved?: (id: string) => void; nested?: boolean;
}) {
  const t = useTranslations();
  const { notify } = useWorkspace();
  const id = useId();
  const course = kind === "course";
  const [discard, setDiscard] = useState(false);
  const mutation = useMutation();
  const form = useForm({
    defaultValues: { name: group?.name ?? "", color: group?.color ?? (course ? "#6366F1" : "#64748B"),
      code: group?.code ?? "", lecturer: group?.lecturer ?? "", description: group?.description ?? "" },
  });
  const isDirty = form.formState.isDirty;
  const close = () => {
    if (mutation.pending) return;
    if (isDirty) setDiscard(true);
    else onClose();
  };
  const fields = [
    { name: "name", max: 100 }, ...(course ? [{ name: "code", max: 30 }, { name: "lecturer", max: 100 }] : []),
    { name: "color", max: 7 },
  ] as const;
  return <DialogFrame layer={nested ? "nested" : "base"} onClose={close} title={t(course
    ? group ? "group.editCourse" : "group.newCourse" : group ? "group.editCategory" : "group.newCategory")}>
    <form noValidate onSubmit={form.handleSubmit(({ name, color, code, lecturer, description }) => {
      void mutation.run(() => saveGroupAction(kind, group?.id ?? null,
        course ? { name, color, code, lecturer } : { name, color, description }), (saved) => {
        notify("feedback.saved");
        onSaved?.(saved);
        onClose();
      });
    })}>
      <div className="dialog-body form-grid">
        {fields.map(({ name, max }) => {
          const key = name as "name" | "code" | "lecturer" | "color";
          return <Field key={name} label={t(`group.${name}`)} id={id + name} error={mutation.fieldErrors[name]}>
            <input id={id + name} type={name === "color" ? "color" : "text"} maxLength={max}
              {...form.register(key)} {...mutation.field(id + name, name)} />
          </Field>;
        })}
        {!course && <Field label={t("group.description")} id={id + "description"} error={mutation.fieldErrors.description}>
          <textarea id={id + "description"} maxLength={500} rows={3} {...form.register("description")}
            {...mutation.field(id + "description", "description")} />
        </Field>}
        {mutation.error && <p className="dialog-error" role="alert">{mutation.error}</p>}
      </div>
      <footer className="dialog-footer">
        <Button onClick={close} disabled={mutation.pending}>{t("action.cancel")}</Button>
        <Button type="submit" variant="primary" disabled={mutation.pending}>{t(mutation.pending ? "feedback.saving" : "action.save")}</Button>
      </footer>
    </form>
    {discard && <Confirmation title={t("dialog.discardTitle")} description={t("dialog.discardDescription")}
      cancel={() => setDiscard(false)} confirm={onClose} label={t("action.discard")} />}
  </DialogFrame>;
}
