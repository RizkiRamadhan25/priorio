"use client";

import { Check, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { taskGroup } from "@/domain/types";
import type { Status, Task } from "@/domain/types";
import { rankTasks } from "@/domain/priority";
import { removeTaskAction, statusAction } from "@/server/actions/workspace";
import { useWorkspace } from "@/components/shell/workspace-context";
import type { TaskDialogState } from "@/components/shell/workspace-context";
import { useMutation } from "@/components/shared/feedback";
import { Button, DialogFrame, Empty } from "@/components/ui/primitives";
import { Confirmation } from "@/components/ui/confirmation";
import { CompletionLabel, DateLabel, DifficultyLabel, GroupLabel, PriorityLabel, StatusLabel } from "./task-labels";
import { TaskEditor } from "./task-editor";

function TaskDetails({ task, onClose, onEdit }: { task: Task; onClose: () => void; onEdit: () => void }) {
  const t = useTranslations();
  const { workspace, now, notify } = useWorkspace();
  const [confirm, setConfirm] = useState<"remove" | "reopen" | null>(null);
  const mutation = useMutation();
  const dialogMutation = useMutation();
  const group = taskGroup(task, workspace);
  const priority = rankTasks([task], now, workspace.zone)[0];
  const completed = task.status === "COMPLETED";
  const close = () => { if (!mutation.pending) onClose(); };

  function changeStatus(status: Status) {
    const target = status === "COMPLETED" ? mutation : dialogMutation;
    void target.run(() => statusAction(task.id, status), () => {
      notify(status === "COMPLETED" ? "feedback.completed" : "feedback.reopened");
      onClose();
    });
  }

  return <DialogFrame title={t("task.detail")} onClose={close}>
    <div className="dialog-body details-body">
      <h3 className="task-detail-title">{task.title}</h3>
      <div className="detail-tags"><StatusLabel status={task.status} />{priority && <PriorityLabel bucket={priority.bucket} />}</div>
      <dl className="detail-grid">
        <div><dt>{t("task.type")}</dt><dd>{t(`task.typeLabels.${task.taskType}`)}</dd></div>
        <div><dt>{t(task.taskType === "ACADEMIC" ? "group.course" : "group.category")}</dt>
          <dd><GroupLabel task={task} name={group?.name} color={group?.color} /></dd></div>
        <div><dt>{t("task.assigned")}</dt><dd><DateLabel value={task.assignedDate} /></dd></div>
        <div><dt>{t("task.deadline")}</dt><dd><DateLabel value={task.dueDate} time={task.dueTime} />
          {!task.dueTime && <span className="date-time">{t("task.endOfDay")}</span>}</dd></div>
        <div><dt>{t("task.level")}</dt><dd><DifficultyLabel level={task.difficultyLevel} /></dd></div>
        {task.completedAt && <div><dt>{t("task.completedAt")}</dt><dd><CompletionLabel value={task.completedAt} zone={workspace.zone} /></dd></div>}
      </dl>
      {task.description && <div className="detail-copy"><strong>{t("task.description")}</strong><p>{task.description}</p></div>}
      {task.notes && <div className="detail-copy"><strong>{t("task.notes")}</strong><p>{task.notes}</p></div>}
      {mutation.error && <p className="dialog-error" role="alert">{mutation.error}</p>}
    </div>
    <footer className="dialog-footer detail-footer">
      <Button variant="ghost" className="delete-text" disabled={mutation.pending} onClick={() => setConfirm("remove")}><Trash2 size={16} />{t("action.delete")}</Button>
      <Button disabled={mutation.pending} onClick={onEdit}><Pencil size={16} />{t("action.edit")}</Button>
      <Button variant="primary" disabled={mutation.pending} onClick={() => completed ? setConfirm("reopen") : changeStatus("COMPLETED")}>
        {completed ? <RotateCcw size={16} /> : <Check size={16} />}
        {t(mutation.pending ? "feedback.saving" : completed ? "action.reopen" : "action.complete")}
      </Button>
    </footer>
    {confirm === "remove" && <Confirmation title={t("dialog.deleteTitle", { name: task.title })}
      description={t("dialog.deleteDescription")} label={t("action.delete")} cancel={() => setConfirm(null)}
      pending={dialogMutation.pending} error={dialogMutation.error}
      confirm={() => void dialogMutation.run(() => removeTaskAction(task.id), () => { notify("feedback.deleted"); onClose(); })} />}
    {confirm === "reopen" && <DialogFrame title={t("dialog.reopenTitle", { name: task.title })}
      description={t("dialog.reopenDescription")} layer="confirm" onClose={() => { if (!dialogMutation.pending) setConfirm(null); }}>
      {dialogMutation.error && <p className="dialog-error" role="alert">{dialogMutation.error}</p>}
      <footer className="dialog-footer">
        <Button disabled={dialogMutation.pending} onClick={() => changeStatus("TODO")}>{t("task.statusLabels.TODO")}</Button>
        <Button variant="primary" disabled={dialogMutation.pending} onClick={() => changeStatus("IN_PROGRESS")}>{t("task.statusLabels.IN_PROGRESS")}</Button>
      </footer>
    </DialogFrame>}
  </DialogFrame>;
}

export function TaskDialog({ state, onClose }: { state: TaskDialogState; onClose: () => void }) {
  const t = useTranslations();
  const { workspace } = useWorkspace();
  const [editing, setEditing] = useState(false);
  if (state.kind === "new") return <TaskEditor selectedDue={state.dueDate} onClose={onClose} />;
  const task = workspace.tasks.find(({ id }) => id === state.id);
  if (!task) return <DialogFrame title={t("task.detail")} onClose={onClose}><Empty title={t("error.missing")} /></DialogFrame>;
  return editing ? <TaskEditor task={task} onClose={onClose} /> :
    <TaskDetails task={task} onClose={onClose} onEdit={() => setEditing(true)} />;
}
