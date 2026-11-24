export const taskTypes = ["ACADEMIC", "NONACADEMIC"] as const;
export const statuses = ["TODO", "IN_PROGRESS", "COMPLETED"] as const;
export type TaskType = (typeof taskTypes)[number];
export type Status = (typeof statuses)[number];
export type GroupKind = "course" | "category";

export interface Group {
  id: string;
  name: string;
  color: string;
  isArchived: boolean;
  code?: string | null;
  lecturer?: string | null;
  description?: string | null;
  count: number;
  active: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  notes: string | null;
  taskType: TaskType;
  courseId: string | null;
  categoryId: string | null;
  assignedDate: string;
  dueDate: string;
  dueTime: string | null;
  difficultyLevel: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Settings {
  theme: "light" | "dark";
  language: "id" | "en";
  sidebarCollapsed: boolean;
}

export const defaultSettings: Settings = { theme: "light", language: "id", sidebarCollapsed: false };

export interface Workspace {
  tasks: Task[];
  courses: Group[];
  categories: Group[];
  settings: Settings;
  databasePath: string;
  zone: string;
  now: number;
  error: boolean;
}

export type ErrorCode = "validation" | "missing" | "duplicate" | "referenced" | "archived" | "storage" | "origin";
export type Result<T> = { ok: true; data: T } | { ok: false; code: ErrorCode; fieldErrors?: Record<string, string> };

export function taskGroup(task: Pick<Task, "taskType" | "courseId" | "categoryId">, data: Pick<Workspace, "courses" | "categories">) {
  return task.taskType === "ACADEMIC"
    ? data.courses.find((group) => group.id === task.courseId)
    : data.categories.find((group) => group.id === task.categoryId);
}
