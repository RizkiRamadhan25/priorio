import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const parent = /[?#]/u.test(tmpdir()) ? resolve(".work") : tmpdir();
mkdirSync(parent, { recursive: true });
const directory = mkdtempSync(join(parent, "priorio-e2e-"));
const path = join(directory, "test.sqlite");
const env = { ...process.env, DATABASE_URL: "file:" + path.replaceAll("\\", "/"), PRIORIO_PORT: "3100", NEXT_TELEMETRY_DISABLED: "1" };

function cleanup() {
  if (dirname(directory) === parent && basename(directory).startsWith("priorio-e2e-")) {
    rmSync(directory, { recursive: true, force: true, maxRetries: 3 });
  }
}

for (const command of [["migrate", "deploy"], ["db", "seed"]]) {
  const result = spawnSync(process.execPath, ["scripts/prisma.mjs", ...command], { env, stdio: "inherit" });
  if (result.status !== 0) {
    cleanup();
    process.exit(result.status ?? 1);
  }
}

if (process.env.PRIORIO_BENCH === "1") {
  const result = spawnSync(process.execPath, [require.resolve("tsx/cli"), "scripts/benchmark-data.ts"], { env, stdio: "inherit" });
  if (result.status !== 0) {
    cleanup();
    process.exit(result.status ?? 1);
  }
}

const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", "3100"], {
  env, stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => { cleanup(); process.exitCode = code ?? 0; });
