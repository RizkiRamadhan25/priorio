"use client";

import { ClipboardCheck, Ellipsis, ListTodo } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ReactNode } from "react";
import { taskGroup } from "@/domain/types";
import type { Task } from "@/domain/types";
import type { rankTasks } from "@/domain/priority";
import { useWorkspace } from "@/components/shell/workspace-context";
import { Button, Empty, IconButton } from "@/components/ui/primitives";
import { CompletionLabel, DateLabel, DifficultyLabel, GroupLabel, PriorityLabel, StatusLabel } from "./task-labels";

type Priority = ReturnType<typeof rankTasks<Task>>[number];
const pageSize = 30;

export function TaskList({ tasks, priorities, mode, emptyTitle, emptyDetail, emptyAction }: {
  tasks: Task[]; priorities?: Map<string, Priority>; mode: "tasks" | "priority" | "completed" | "compact";
  emptyTitle: string; emptyDetail?: string; emptyAction?: ReactNode;
}) {
  const t = useTranslations();
  const { workspace, viewTask } = useWorkspace();
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(tasks.length / pageSize);
  const current = Math.min(page, totalPages || 1);
  const compact = mode === "compact";
  const ranked = mode === "priority";
  const completed = mode === "completed";
  if (!tasks.length) return <Empty title={emptyTitle} detail={emptyDetail} action={emptyAction}
    icon={compact ? undefined : completed ? <ClipboardCheck size={26} /> : <ListTodo size={26} />} />;
  return <div className={`task-list task-list-${mode}`}>
    {!compact && <div className="task-table-head" aria-hidden="true">
      {ranked && <span>#</span>}<span>{t("task.title")}</span>
      <span>{t(completed ? "task.completedAt" : "task.deadline")}</span><span>{t("task.level")}</span>
      <span>{t("task.status")}</span>{!completed && <span>{t(ranked ? "priority.score" : "priority.label")}</span>}<span />
    </div>}
    <ul>
      {tasks.slice((current - 1) * pageSize, current * pageSize).map((task) => {
        const group = taskGroup(task, workspace);
        const priority = priorities?.get(task.id);
        return <li className="task-row" key={task.id}>
          {ranked && <span className="task-rank" aria-label={t("priority.rank") + " " + priority?.rank}>{priority?.rank}</span>}
          <div className="task-title-cell">
            <button className="task-title-button" onClick={() => viewTask(task.id)}>{task.title}</button>
            <GroupLabel task={task} name={group?.name} color={group?.color} />
          </div>
          <div className="task-deadline">
            {completed && task.completedAt ? <CompletionLabel zone={workspace.zone} value={task.completedAt} /> :
              <DateLabel value={task.dueDate} time={task.dueTime} />}
          </div>
          {!compact && <DifficultyLabel level={task.difficultyLevel} />}
          {!compact && <StatusLabel status={task.status} />}
          {!completed && priority && <div className="task-priority">
            <PriorityLabel bucket={priority.bucket} />
            {ranked && <span className="rank-reason">{priority.score} <span aria-hidden="true">·</span> {t(`deadline.${priority.bucket}`)} <span aria-hidden="true">·</span> L{task.difficultyLevel}</span>}
          </div>}
          {!completed && !compact && !priority && <span />}
          {!compact && <IconButton label={t("task.detail")} onClick={() => viewTask(task.id)}><Ellipsis size={20} /></IconButton>}
        </li>;
      })}
    </ul>
    {totalPages > 1 && <div className="pagination">
      <Button disabled={current <= 1} onClick={() => setPage(current - 1)}>{t("action.previous")}</Button>
      <span>{t("filter.page", { page: current, total: totalPages })}</span>
      <Button disabled={current >= totalPages} onClick={() => setPage(current + 1)}>{t("action.next")}</Button>
    </div>}
  </div>;
}
