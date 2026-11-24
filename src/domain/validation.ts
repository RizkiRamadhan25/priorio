import { z } from "zod";
import { isLocalDate } from "@/lib/dates/local";
import { statuses, taskTypes } from "./types";

const requiredText = (limit: number) => z.string().trim().min(1, "required").max(limit, "tooLong");
const optionalText = (limit: number) =>
  z.string().trim().max(limit, "tooLong").nullish().transform((value) => value || null);

export const entityId = z.uuid({ error: "invalid" });
const groupRef = z.union([entityId, z.literal(""), z.null()]).optional().transform((value) => value || null);
const date = z.string().refine(isLocalDate, "date");
const time = z.union([z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/u, "time"), z.literal(""), z.null()])
  .optional().transform((value) => value || null);

export const taskInput = z.strictObject({
  title: requiredText(150),
  description: optionalText(5000),
  notes: optionalText(2000),
  taskType: z.enum(taskTypes, { error: "invalid" }),
  courseId: groupRef,
  categoryId: groupRef,
  assignedDate: date,
  dueDate: date,
  dueTime: time,
  difficultyLevel: z.number({ error: "level" }).int("level").min(0, "level").max(5, "level"),
  status: z.enum(statuses, { error: "invalid" }),
}).superRefine((task, context) => {
  const academic = task.taskType === "ACADEMIC";
  if (academic ? !task.courseId || task.categoryId : !task.categoryId || task.courseId) {
    context.addIssue({ code: "custom", message: "group", path: [academic ? "courseId" : "categoryId"] });
  }
  if (task.dueDate < task.assignedDate) context.addIssue({ code: "custom", message: "dateOrder", path: ["dueDate"] });
});

const groupFields = {
  name: requiredText(100),
  color: z.string().regex(/^#[\da-f]{6}$/iu, "color").transform((value) => value.toUpperCase()),
};

export const courseInput = z.strictObject({ ...groupFields, code: optionalText(30), lecturer: optionalText(100) });
export const categoryInput = z.strictObject({ ...groupFields, description: optionalText(500) });

export const settingsInput = z.strictObject({
  theme: z.enum(["light", "dark"]),
  language: z.enum(["id", "en"]),
  sidebarCollapsed: z.boolean(),
}).partial().refine((input) => Object.keys(input).length > 0, "required");

export function completionTime(previous: string | undefined, status: string, stamp: Date, previousAt?: Date | null) {
  if (status !== "COMPLETED") return null;
  return previous === "COMPLETED" && previousAt ? previousAt : stamp;
}
