"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { GroupKind, Result } from "@/domain/types";
import { allowedMutation } from "@/server/security/origin";
import { archiveGroup, removeGroup, saveGroup } from "@/server/services/groups";
import { failure } from "@/server/services/results";
import { saveSettings } from "@/server/services/settings";
import { changeTaskStatus, removeTask, saveTask } from "@/server/services/tasks";

async function mutate<T>(operation: () => Promise<T>): Promise<Result<T>> {
  try {
    if (!allowedMutation(await headers())) return { ok: false, code: "origin" };
    const data = await operation();
    revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (error) {
    return failure(error);
  }
}

function isKind(kind: unknown): kind is GroupKind {
  return kind === "course" || kind === "category";
}

export async function saveGroupAction(kind: GroupKind, id: string | null, data: unknown) {
  if (!isKind(kind)) return { ok: false, code: "validation" } as const;
  return mutate(() => saveGroup(kind, id, data));
}

export async function archiveGroupAction(kind: GroupKind, id: string, value: boolean) {
  if (!isKind(kind)) return { ok: false, code: "validation" } as const;
  return mutate(() => archiveGroup(kind, id, value));
}

export async function removeGroupAction(kind: GroupKind, id: string) {
  if (!isKind(kind)) return { ok: false, code: "validation" } as const;
  return mutate(() => removeGroup(kind, id));
}

export async function saveTaskAction(id: string | null, data: unknown) {
  return mutate(() => saveTask(id, data));
}

export async function statusAction(id: string, value: string) {
  return mutate(() => changeTaskStatus(id, value));
}

export async function removeTaskAction(id: string) {
  return mutate(() => removeTask(id));
}

export async function settingsAction(data: unknown) {
  return mutate(() => saveSettings(data));
}
