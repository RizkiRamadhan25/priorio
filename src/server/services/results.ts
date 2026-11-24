import "server-only";
import { z } from "zod";
import type { ErrorCode, Result } from "@/domain/types";

export class DomainIssue extends Error {
  constructor(public readonly code: ErrorCode, public readonly fieldErrors?: Record<string, string>) {
    super(code);
  }
}

export function parse<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const fieldErrors = Object.fromEntries(result.error.issues
    .filter((issue) => typeof issue.path[0] === "string")
    .map((issue) => [String(issue.path[0]), issue.code === "invalid_type" && issue.message.startsWith("Invalid input") ? "invalid" : issue.message]));
  throw new DomainIssue("validation", fieldErrors);
}

export function failure(error: unknown): Result<never> {
  if (error instanceof DomainIssue) return { ok: false, code: error.code, fieldErrors: error.fieldErrors };
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (code === "P2002") return { ok: false, code: "duplicate", fieldErrors: { name: "duplicate" } };
  if (code === "P2003") return { ok: false, code: "referenced" };
  if (code === "P2025") return { ok: false, code: "missing" };
  console.error("[Priorio] Storage operation failed.");
  return { ok: false, code: "storage" };
}
