import { addDays, localDate } from "@/lib/dates/local";
import { rankTasks, compareText } from "./priority";
import type { Task, Workspace } from "./types";

export function statistics(workspace: Pick<Workspace, "tasks" | "courses" | "categories" | "zone">, now: number) {
  const { tasks, courses, categories, zone } = workspace;
  const ranked = rankTasks(tasks, now, zone);
  const today = localDate(now, zone);
  const lastDay = addDays(today, 6);
  const status = { TODO: 0, IN_PROGRESS: 0, COMPLETED: 0 };
  for (const task of tasks) status[task.status]++;
  return {
    total: tasks.length, active: ranked.length, completed: status.COMPLETED, status,
    overdue: ranked.filter((entry) => entry.bucket === "overdue").length,
    percentage: tasks.length ? Math.round(status.COMPLETED / tasks.length * 1000) / 10 : 0,
    top: ranked.slice(0, 5),
    upcoming: ranked.filter(({ task, bucket }) => bucket !== "overdue" && task.dueDate >= today && task.dueDate <= lastDay)
      .sort((a, b) => a.due - b.due || compareText(a.task.id, b.task.id)).map(({ task }) => task),
    groups: [...courses, ...categories].filter((group) => group.count).sort((a, b) => b.count - a.count || compareText(a.name, b.name)),
  };
}

export function sortByDueTime(tasks: readonly Task[]) {
  return [...tasks].sort((a, b) => compareText(a.dueTime ?? "24:00", b.dueTime ?? "24:00") || compareText(a.id, b.id));
}
