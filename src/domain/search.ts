import { deadlineBucket, compareText, rankTasks } from "./priority";
import type { Bucket } from "./priority";
import type { Status, Task, TaskType } from "./types";
import { localDate, deadlineInstant } from "@/lib/dates/local";
import { normalize } from "@/lib/validation/normalization";

export const orderKeys = ["priority", "deadline", "difficulty", "created", "title"] as const;
export type Order = (typeof orderKeys)[number];

export interface Filters {
  query: string;
  types: TaskType[];
  courses: string[];
  categories: string[];
  levels: number[];
  statuses: Status[];
  deadlines: Bucket[];
}

export const emptyFilters: Filters = { query: "", types: [], courses: [], categories: [], levels: [], statuses: [], deadlines: [] };

export function filterTasks(tasks: readonly Task[], filters: Filters, now: number, zone: string) {
  const query = normalize(filters.query);
  const today = localDate(now, zone);
  return tasks.filter((task) => {
    if (query && !normalize(task.title).includes(query) && !normalize(task.description ?? "").includes(query)) return false;
    if (filters.types.length && !filters.types.includes(task.taskType)) return false;
    if (filters.courses.length && (!task.courseId || !filters.courses.includes(task.courseId))) return false;
    if (filters.categories.length && (!task.categoryId || !filters.categories.includes(task.categoryId))) return false;
    if (filters.levels.length && !filters.levels.includes(task.difficultyLevel)) return false;
    if (filters.statuses.length && !filters.statuses.includes(task.status)) return false;
    if (!filters.deadlines.length) return true;
    if (task.status === "COMPLETED" && task.dueDate < today) return false;
    return filters.deadlines.includes(deadlineBucket(task, now, today, deadlineInstant(task.dueDate, task.dueTime, zone)));
  });
}

export function sortTasks(tasks: readonly Task[], order: Order, direction: "asc" | "desc", now: number, zone: string) {
  const sign = direction === "asc" ? 1 : -1;
  const due = new Map(tasks.map((task) => [task.id, deadlineInstant(task.dueDate, task.dueTime, zone)]));
  const byDeadline = (a: Task, b: Task) => (due.get(a.id) ?? 0) - (due.get(b.id) ?? 0);
  if (order === "priority") {
    const active = rankTasks(tasks, now, zone);
    if (direction === "asc") active.sort((a, b) => a.score - b.score || a.rank - b.rank);
    const completed = tasks.filter((task) => task.status === "COMPLETED").sort((a, b) =>
      byDeadline(a, b) || compareText(a.createdAt, b.createdAt) || compareText(a.id, b.id));
    return [...active.map(({ task }) => task), ...completed];
  }
  const compare: Record<Exclude<Order, "priority">, (a: Task, b: Task) => number> = {
    deadline: byDeadline,
    difficulty: (a, b) => a.difficultyLevel - b.difficultyLevel,
    created: (a, b) => compareText(a.createdAt, b.createdAt),
    title: (a, b) => compareText(normalize(a.title), normalize(b.title)),
  };
  return [...tasks].sort((a, b) => sign * compare[order](a, b) || compareText(a.id, b.id));
}

export function latestCompleted(tasks: readonly Task[]) {
  return tasks.filter((task) => task.status === "COMPLETED")
    .sort((a, b) => compareText(b.completedAt ?? "", a.completedAt ?? "") || compareText(a.id, b.id));
}
