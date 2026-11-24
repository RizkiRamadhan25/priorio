"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { localDate } from "@/lib/dates/local";
import { statuses, taskTypes } from "@/domain/types";
import type { Status, Task, TaskType } from "@/domain/types";
import { saveTaskAction } from "@/server/actions/workspace";
import { useWorkspace } from "@/components/shell/workspace-context";
import { useMutation } from "@/components/shared/feedback";
import { Button, DialogFrame, Field } from "@/components/ui/primitives";
import { Confirmation } from "@/components/ui/confirmation";
import { GroupEditor } from "@/components/groups/group-editor";

interface Draft {
  title: string; taskType: TaskType; courseId: string; categoryId: string; assignedDate: string; dueDate: string; dueTime: string;
  status: Status; difficultyLevel: number; description: string; notes: string;
}

export function TaskEditor({ task, selectedDue, onClose }: { task?: Task; selectedDue?: string; onClose: () => void }) {
  const t = useTranslations();
  const { workspace, now, notify } = useWorkspace();
  const id = useId();
  const today = localDate(now, workspace.zone);
  const [nestedGroup, setNestedGroup] = useState(false);
  const [discard, setDiscard] = useState(false);
  const mutation = useMutation();
  const form = useForm<Draft>({
    defaultValues: {
      title: task?.title ?? "", taskType: task?.taskType ?? "ACADEMIC", status: task?.status ?? "TODO",
      courseId: task?.courseId ?? "", categoryId: task?.categoryId ?? "",
      assignedDate: task?.assignedDate ?? (selectedDue && selectedDue < today ? selectedDue : today),
      dueDate: task?.dueDate ?? selectedDue ?? "", dueTime: task?.dueTime ?? "",
      difficultyLevel: task?.difficultyLevel ?? 0, description: task?.description ?? "", notes: task?.notes ?? "",
    },
  });
  const { isDirty } = form.formState;
  const type = useWatch({ control: form.control, name: "taskType" });
  const level = useWatch({ control: form.control, name: "difficultyLevel" });
  const academic = type === "ACADEMIC";
  const groupKey = academic ? "courseId" : "categoryId";
  const groupKind = academic ? "course" : "category";
  const selectedGroup = useWatch({ control: form.control, name: groupKey });
  const groups = (academic ? workspace.courses : workspace.categories)
    .filter((group) => !group.isArchived || group.id === task?.[groupKey]);

  function close() {
    if (mutation.pending) return;
    if (isDirty) setDiscard(true);
    else onClose();
  }

  function chooseType(value: TaskType) {
    form.setValue("taskType", value, { shouldDirty: true });
    form.setValue("courseId", "", { shouldDirty: true });
    form.setValue("categoryId", "", { shouldDirty: true });
  }

  const field = (name: keyof Draft, label: string, input: ReactNode) =>
    <Field id={id + name} label={t(label)} error={mutation.fieldErrors[name]}>{input}</Field>;
  const input = (name: keyof Draft, type = "text") =>
    <input id={id + name} type={type} {...form.register(name)} {...mutation.field(id + name, name)} />;

  return <DialogFrame title={t(task ? "task.edit" : "task.add")} onClose={close}>
    <form noValidate onSubmit={form.handleSubmit((draft) => {
      void mutation.run(() => saveTaskAction(task?.id ?? null, draft), () => { notify("feedback.saved"); onClose(); });
    })}>
      <div className="dialog-body form-grid">
        {field("title", "task.title", <input id={id + "title"} placeholder={t("task.placeholder")} maxLength={150}
          {...form.register("title")} {...mutation.field(id + "title", "title")} />)}
        <fieldset className="field"><legend>{t("task.type")}</legend>
          <div className="segments">
            {taskTypes.map((value) => <label key={value}><input type="radio" name={id + "type"} checked={type === value}
              onChange={() => chooseType(value)} /><span>{t(`task.typeLabels.${value}`)}</span></label>)}
          </div>
        </fieldset>
        {field(groupKey, `group.${groupKind}`, <div className="inline-field">
          <select key={groupKey} id={id + groupKey} value={selectedGroup}
            {...form.register(groupKey)} {...mutation.field(id + groupKey, groupKey)}>
            <option value="">{t("task.noGroup")}</option>
            {groups.map((group) => <option key={group.id} value={group.id}>
              {group.name}{group.isArchived ? ` (${t("group.archived")})` : ""}
            </option>)}
          </select>
          <Button onClick={() => setNestedGroup(true)}><Plus size={16} />{t(academic ? "group.newCourse" : "group.newCategory")}</Button>
        </div>)}
        <div className="form-row">
          {field("assignedDate", "task.assigned", input("assignedDate", "date"))}
          {field("dueDate", "task.dueDate", input("dueDate", "date"))}
        </div>
        <div className="form-row">
          {field("dueTime", "task.dueTime", input("dueTime", "time"))}
          {field("status", "task.status", <select id={id + "status"} {...form.register("status")} {...mutation.field(id + "status", "status")}>
            {statuses.map((status) => <option key={status} value={status}>{t(`task.statusLabels.${status}`)}</option>)}
          </select>)}
        </div>
        <fieldset className="field"><legend>{t("task.level")}</legend>
          <div className="segments level-segments">{[0, 1, 2, 3, 4, 5].map((value) =>
            <label key={value}><input type="radio" name={id + "level"} checked={level === value}
              aria-label={`L${value} ${t(`task.difficulty.${value}`)}`}
              onChange={() => form.setValue("difficultyLevel", value, { shouldDirty: true })} /><span>L{value}</span></label>)}</div>
          <span className="muted">{t(`task.difficulty.${level}`)}</span>
        </fieldset>
        <details className="optional-fields" open={task?.description || task?.notes ? true : undefined}>
          <summary>{t("task.optional")}</summary>
          {field("description", "task.description", <textarea id={id + "description"} maxLength={5000} rows={3}
            {...form.register("description")} {...mutation.field(id + "description", "description")} />)}
          {field("notes", "task.notes", <textarea id={id + "notes"} maxLength={2000} rows={3}
            {...form.register("notes")} {...mutation.field(id + "notes", "notes")} />)}
        </details>
        {mutation.error && <p className="dialog-error" role="alert">{mutation.error}</p>}
      </div>
      <footer className="dialog-footer">
        <Button onClick={close} disabled={mutation.pending}>{t("action.cancel")}</Button>
        <Button type="submit" variant="primary" disabled={mutation.pending}>{t(mutation.pending ? "feedback.saving" : "action.save")}</Button>
      </footer>
    </form>
    {nestedGroup && <GroupEditor nested kind={groupKind} onClose={() => setNestedGroup(false)}
      onSaved={(savedId) => form.setValue(groupKey, savedId, { shouldDirty: true })} />}
    {discard && <Confirmation title={t("dialog.discardTitle")} description={t("dialog.discardDescription")}
      cancel={() => setDiscard(false)} confirm={onClose} label={t("action.discard")} />}
  </DialogFrame>;
}
