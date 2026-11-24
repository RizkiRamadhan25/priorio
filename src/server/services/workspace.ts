import "server-only";
import { cache } from "react";
import { defaultSettings } from "@/domain/types";
import type { Workspace } from "@/domain/types";
import { databaseLocation } from "@/lib/env/database";
import { readSnapshot } from "@/server/repositories/snapshot";

export const getWorkspace = cache(async (): Promise<Workspace> => {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = Date.now();
  let databasePath = "";
  try {
    databasePath = databaseLocation().path;
    return { ...await readSnapshot(), zone, now, databasePath, error: false };
  } catch {
    console.error("[Priorio] Workspace read failed.");
    return { tasks: [], courses: [], categories: [], settings: defaultSettings, databasePath, zone, now, error: true };
  }
});
