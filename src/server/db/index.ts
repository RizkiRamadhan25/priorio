import "server-only";
import { createDatabase } from "./client";

const globalDatabase = globalThis as typeof globalThis & { priorioDb?: ReturnType<typeof createDatabase> };

export function getDatabase() {
  return globalDatabase.priorioDb ??= createDatabase();
}
