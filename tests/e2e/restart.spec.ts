import { execFileSync, spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { testDatabase } from "../fixtures/database";

const url = "http://127.0.0.1:3101";
const requireFromProject = createRequire(resolve("package.json"));

function start(databaseUrl: string) {
  return spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", "3101"], {
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", DATABASE_URL: databaseUrl, PRIORIO_PORT: "3101" }, stdio: "ignore",
  });
}

async function stop(child: ChildProcess) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, "exit");
  child.kill();
  await exited;
}

async function check(page: Page) {
  await expect.poll(async () => {
    try { return (await fetch(url + "/settings")).status; }
    catch { return 0; }
  }, { timeout: 10000 }).toBe(200);
  await page.goto(url + "/settings");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByLabel("Desktop sidebar")).toBeChecked();
  await expect(page.getByText("1.0.0", { exact: true })).toBeVisible();
  await page.goto(url + "/tasks");
  await expect(page.getByRole("button", { name: "Persisted fixture", exact: true })).toBeVisible();
}

test("AC-021 restarts a production server and retains persisted tasks and preferences", async ({ page }) => {
  const fixture = testDatabase();
  try {
    fixture.migrate();
    execFileSync(process.execPath, [requireFromProject.resolve("tsx/cli"), "tests/fixtures/restart-data.ts"], {
      env: { ...process.env, DATABASE_URL: fixture.url, PRIORIO_PORT: "3101" }, stdio: "pipe",
    });
    const first = start(fixture.url);
    try { await check(page); } finally { await stop(first); }
    const second = start(fixture.url);
    try { await check(page); } finally { await stop(second); }
  } finally {
    fixture.cleanup();
  }
});
