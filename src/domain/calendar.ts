import { addDays, daysInMonth, localWeekday } from "@/lib/dates/local";
import { sortByDueTime } from "./statistics";
import type { Task } from "./types";

export function monthGrid(month: string) {
  const first = month + "-01";
  const offset = (localWeekday(first) + 6) % 7;
  const start = addDays(first, -offset);
  const rows = Math.ceil((daysInMonth(month) + offset) / 7);
  return Array.from({ length: rows * 7 }, (_, index) => addDays(start, index));
}

export function tasksByDay(tasks: readonly Task[], active: boolean, completed: boolean) {
  const days = new Map<string, Task[]>();
  for (const task of sortByDueTime(tasks)) {
    if (task.status === "COMPLETED" ? !completed : !active) continue;
    const items = days.get(task.dueDate);
    if (items) items.push(task);
    else days.set(task.dueDate, [task]);
  }
  return days;
}
