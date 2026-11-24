import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export function testDatabase() {
  const parent = /[?#]/u.test(tmpdir()) ? resolve(".work") : tmpdir();
  mkdirSync(parent, { recursive: true });
  const directory = mkdtempSync(join(parent, "priorio-test-"));
  const path = join(directory, "test.sqlite");
  const url = "file:" + path.replaceAll("\\", "/");
  return {
    directory, path, url,
    migrate() {
      execFileSync(process.execPath, [resolve("scripts/prisma.mjs"), "migrate", "deploy"], {
        env: { ...process.env, DATABASE_URL: url, CHECKPOINT_DISABLE: "1" }, stdio: "pipe",
      });
    },
    cleanup() { rmSync(directory, { recursive: true, force: true, maxRetries: 3 }); },
  };
}
