"use client";

import { Archive, Folder, GraduationCap, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Group, GroupKind } from "@/domain/types";
import { archiveGroupAction, removeGroupAction } from "@/server/actions/workspace";
import { Button, Empty, IconButton, PageHeader } from "@/components/ui/primitives";
import { Confirmation } from "@/components/ui/confirmation";
import { useMutation } from "@/components/shared/feedback";
import { useWorkspace } from "@/components/shell/workspace-context";
import { GroupEditor } from "./group-editor";

export function GroupsPage({ kind }: { kind: GroupKind }) {
  const t = useTranslations();
  const { workspace, notify } = useWorkspace();
  const [archived, setArchived] = useState(false);
  const [editor, setEditor] = useState<Group | "new" | null>(null);
  const [remove, setRemove] = useState<Group | null>(null);
  const mutation = useMutation();
  const course = kind === "course";
  const groups = (course ? workspace.courses : workspace.categories).filter((group) => group.isArchived === archived);
  const add = <Button variant="primary" onClick={() => setEditor("new")}><Plus size={17} />
    {t(course ? "group.newCourse" : "group.newCategory")}</Button>;

  return <>
    <PageHeader title={t(course ? "nav.courses" : "nav.categories")}
      description={t(course ? "page.coursesDescription" : "page.categoriesDescription")} action={add} />
    <div className="group-toolbar">
      <label className="check-label"><input type="checkbox" checked={archived} onChange={(event) => setArchived(event.target.checked)} />
        {t("group.showArchived")}</label>
    </div>
    {!groups.length ? <div className="panel"><Empty title={t(archived ? "empty.archived" : course ? "empty.course" : "empty.category")}
      icon={course ? <GraduationCap size={28} /> : <Folder size={28} />} action={archived ? undefined : add} /></div> :
      <ul className="groups-grid">{groups.map((group) => {
        const completed = group.count - group.active;
        return <li key={group.id} className="panel group-card">
          <div className="group-card-heading">
            <span className="group-icon">{course ? <GraduationCap size={22} /> : <Folder size={22} />}</span>
            <div><h2><span className="color-dot" style={{ backgroundColor: group.color }} />{group.name}</h2>
              {group.isArchived && <span className="badge">{t("group.archived")}</span>}</div>
          </div>
          {course ? <p className="group-copy">{[group.code, group.lecturer].filter(Boolean).join(" • ")}</p> :
            <p className="group-copy">{group.description}</p>}
          <p className="muted">{t("group.taskCounts", { active: group.active, total: group.count })}</p>
          <progress max={group.count || 1} value={completed} aria-label={t("dashboard.progress")} />
          <div className="group-card-actions">
            <Link className="button button-secondary" href={`/tasks?${kind}=${encodeURIComponent(group.id)}`}>{t("group.viewTasks")}</Link>
            <div className="group-buttons" role="group" aria-label={t("aria.groupActions", { name: group.name })}>
              <IconButton label={t("action.edit")} onClick={() => setEditor(group)} disabled={mutation.pending}><Pencil size={17} /></IconButton>
              <IconButton label={t(archived ? "action.restore" : "action.archive")} disabled={mutation.pending}
                onClick={() => void mutation.run(() => archiveGroupAction(kind, group.id, !archived), () => notify(archived ? "feedback.restored" : "feedback.archived"))}>
                {archived ? <RotateCcw size={17} /> : <Archive size={17} />}
              </IconButton>
              <IconButton label={t("action.delete")} onClick={() => setRemove(group)} disabled={mutation.pending}><Trash2 size={17} /></IconButton>
            </div>
          </div>
        </li>;
      })}</ul>}
    {mutation.error && !remove && <p className="dialog-error" role="alert">{mutation.error}</p>}
    {editor && <GroupEditor kind={kind} group={editor === "new" ? undefined : editor} onClose={() => setEditor(null)} />}
    {remove && <Confirmation title={t("dialog.deleteTitle", { name: remove.name })} description={t("dialog.deleteDescription")}
      label={t("action.delete")} error={mutation.error} pending={mutation.pending} cancel={() => setRemove(null)}
      confirm={() => void mutation.run(() => removeGroupAction(kind, remove.id), () => { notify("feedback.deleted"); setRemove(null); })} />}
  </>;
}
