import "server-only";
import type { Group, Settings, Task } from "@/domain/types";
import { statuses, taskTypes } from "@/domain/types";
import type { Task as TaskRecord } from "@/generated/prisma/client";
import { getDatabase } from "@/server/db";

function taskDto(record: TaskRecord): Task {
  const status = statuses.find((entry) => entry === record.status);
  const taskType = taskTypes.find((entry) => entry === record.taskType);
  if (!status || !taskType) throw new Error("Invalid persisted task.");
  return { ...record, status, taskType, createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(), completedAt: record.completedAt?.toISOString() ?? null };
}

export async function readSnapshot(): Promise<{ tasks: Task[]; courses: Group[]; categories: Group[]; settings: Settings }> {
  const db = getDatabase();
  return db.$transaction(async (tx) => {
    const tasks = (await tx.task.findMany()).map(taskDto);
    const courses = await tx.course.findMany({ orderBy: { nameKey: "asc" },
      select: { id: true, name: true, code: true, lecturer: true, color: true, isArchived: true } });
    const categories = await tx.category.findMany({ orderBy: { nameKey: "asc" },
      select: { id: true, name: true, description: true, color: true, isArchived: true } });
    const row = await tx.appSettings.findUniqueOrThrow({ where: { id: 1 } });
    const count = new Map<string, { count: number; active: number }>();
    for (const task of tasks) {
      const id = task.courseId ?? task.categoryId;
      if (!id) continue;
      const totals = count.get(id) ?? { count: 0, active: 0 };
      totals.count++;
      if (task.status !== "COMPLETED") totals.active++;
      count.set(id, totals);
    }
    const withCount = <T extends { id: string }>(group: T) => ({ ...group, ...(count.get(group.id) ?? { count: 0, active: 0 }) });
    return { tasks, courses: courses.map(withCount), categories: categories.map(withCount), settings: {
      theme: row.theme === "dark" ? "dark" : "light",
      language: row.language === "en" ? "en" : "id",
      sidebarCollapsed: row.sidebarCollapsed,
    } };
  });
}
