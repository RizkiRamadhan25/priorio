import { addDays, dateOrdinal, deadlineInstant, localDate, localInstant } from "@/lib/dates/local";
import type { Task } from "./types";

export const buckets = ["overdue", "today", "tomorrow", "soon", "week", "later"] as const;
export type Bucket = (typeof buckets)[number];
const urgency: Record<Bucket, number> = { overdue: 100, today: 80, tomorrow: 60, soon: 40, week: 20, later: 0 };

type Rankable = Pick<Task, "id" | "status" | "dueDate" | "dueTime" | "difficultyLevel" | "createdAt">;

export function deadlineBucket(task: Rankable, now: number, today: string, due: number): Bucket {
  if (task.status !== "COMPLETED" && now > due) return "overdue";
  const days = dateOrdinal(task.dueDate) - dateOrdinal(today);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= 3) return "soon";
  if (days <= 7) return "week";
  return "later";
}

function deadlineReader(zone: string) {
  const cache = new Map<string, number>();
  return (task: Rankable) => {
    const key = task.dueDate + (task.dueTime ?? "");
    const known = cache.get(key);
    if (known !== undefined) return known;
    const due = deadlineInstant(task.dueDate, task.dueTime, zone);
    cache.set(key, due);
    return due;
  };
}

export function compareText(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function rankTasks<T extends Rankable>(tasks: readonly T[], now: number, zone: string) {
  const today = localDate(now, zone);
  const readDue = deadlineReader(zone);
  return tasks.filter((task) => task.status !== "COMPLETED").map((task) => {
    const due = readDue(task);
    const bucket = deadlineBucket(task, now, today, due);
    return { task, due, bucket, score: urgency[bucket] + 3 * task.difficultyLevel };
  }).sort((a, b) => b.score - a.score || a.due - b.due ||
    compareText(a.task.createdAt, b.task.createdAt) || compareText(a.task.id, b.task.id))
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function nextBoundary(tasks: readonly Rankable[], now: number, zone: string) {
  const readDue = deadlineReader(zone);
  let next = localInstant(addDays(localDate(now, zone), 1), "00:00", zone);
  for (const task of tasks) {
    if (task.status === "COMPLETED") continue;
    const boundary = readDue(task) + 1;
    if (boundary > now && boundary < next) next = boundary;
  }
  return next;
}
