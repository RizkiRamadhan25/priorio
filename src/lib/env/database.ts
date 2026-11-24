import { existsSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

function canonical(path: string): string {
  if (existsSync(path)) return realpathSync(path);
  const parent = dirname(path);
  if (parent === path) return path;
  return resolve(canonical(parent), relative(parent, path));
}

function within(parent: string, child: string): boolean {
  const comparison = relative(parent, child);
  return !comparison || (comparison !== ".." && !comparison.startsWith(".." + sep) && !isAbsolute(comparison));
}

export function databaseLocation(
  source = process.env.DATABASE_URL ?? "file:./data/priorio.db",
  projectRoot = process.cwd(),
) {
  if (!source.startsWith("file:") || !source.slice(5) || /[?#\r\n\0]/u.test(source)) {
    throw new Error("DATABASE_URL must be a local SQLite file path.");
  }
  const raw = source.slice(5);
  if (raw === ":memory:" || /^(?:[/\\]{2}|[a-z]:[^/\\])/iu.test(raw)) {
    throw new Error("DATABASE_URL must point to a persistent local file.");
  }
  const requested = resolve(projectRoot, raw);
  const publicDirectories = ["public", ".next/static"].map((entry) => resolve(projectRoot, entry));
  const path = canonical(requested);
  if (publicDirectories.some((directory) => within(directory, requested) || within(canonical(directory), path))) {
    throw new Error("The database must be outside the public directory.");
  }
  return { path, url: "file:" + path.replaceAll("\\", "/") };
}
