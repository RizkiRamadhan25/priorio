"use client";

import { createContext, useContext } from "react";
import type { Settings, Workspace } from "@/domain/types";

export type TaskDialogState = { kind: "new"; dueDate?: string } | { kind: "detail"; id: string };

export interface WorkspaceContextValue {
  workspace: Workspace;
  now: number;
  openTask: (dueDate?: string) => void;
  viewTask: (id: string) => void;
  notify: (message: string) => void;
  updateSettings: (value: Partial<Settings>) => void;
  settingsPending: boolean;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
export function useWorkspace() {
  const data = useContext(WorkspaceContext);
  if (!data) throw new Error("Workspace context is missing.");
  return data;
}
