import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const browserPath = resolve(".work/browsers");
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync(browserPath)) process.env.PLAYWRIGHT_BROWSERS_PATH = browserPath;

export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: false, workers: 1,
  use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/e2e-server.mjs", url: "http://127.0.0.1:3100", reuseExistingServer: false, timeout: 60000,
  },
});
