import "server-only";
import { z } from "zod";
import { statuses } from "@/domain/types";
import { completionTime, entityId, taskInput } from "@/domain/validation";
import type { Task as TaskRecord } from "@/generated/prisma/client";
import { transaction } from "@/server/repositories/mutations";
import type { Transaction } from "@/server/repositories/mutations";
import { DomainIssue, parse } from "./results";

async function getTask(tx: Transaction, id: string) {
  const task = await tx.task.findUnique({ where: { id } });
  if (!task) throw new DomainIssue("missing");
  return task;
}

async function checkGroup(tx: Transaction, task: z.output<typeof taskInput>, current: TaskRecord | null) {
  const field = task.taskType === "ACADEMIC" ? "courseId" : "categoryId";
  const groupId = task[field];
  if (!groupId) throw new DomainIssue("validation", { [field]: "group" });
  const where = { id: groupId };
  const group = field === "courseId"
    ? await tx.course.findUnique({ where })
    : await tx.category.findUnique({ where });
  if (!group) throw new DomainIssue("validation", { [field]: "group" });
  if (group.isArchived && current?.[field] !== groupId) throw new DomainIssue("archived", { [field]: "archived" });
}

export function saveTask(rawId: unknown, input: unknown, clock = () => new Date()) {
  const id = rawId === null ? null : parse(entityId, rawId);
  const task = parse(taskInput, input);
  return transaction(async (tx) => {
    const current = id ? await getTask(tx, id) : null;
    await checkGroup(tx, task, current);
    const stamp = clock();
    const data = { ...task, updatedAt: stamp, completedAt: completionTime(current?.status, task.status, stamp, current?.completedAt) };
    const record = id
      ? await tx.task.update({ where: { id }, data })
      : await tx.task.create({ data: { ...data, createdAt: stamp } });
    return record.id;
  });
}

export function changeTaskStatus(rawId: unknown, value: unknown, clock = () => new Date()) {
  const id = parse(entityId, rawId);
  const status = parse(z.enum(statuses), value);
  return transaction(async (tx) => {
    const current = await getTask(tx, id);
    const stamp = clock();
    await tx.task.update({ where: { id }, data: {
      status, updatedAt: stamp, completedAt: completionTime(current.status, status, stamp, current.completedAt),
    } });
    return id;
  });
}

export function removeTask(rawId: unknown) {
  const id = parse(entityId, rawId);
  return transaction(async (tx) => {
    await tx.task.delete({ where: { id } });
    return id;
  });
}
