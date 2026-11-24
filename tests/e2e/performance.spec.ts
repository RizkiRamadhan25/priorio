import { mkdirSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { expect, test } from "@playwright/test";

function p95(samples: number[]) {
  return [...samples].sort((left, right) => left - right)[Math.ceil(samples.length * .95) - 1];
}

test("T-18 5000-item browser benchmark and warm latency", async ({ page }) => {
  test.skip(process.env.PRIORIO_BENCH !== "1", "Run the benchmark with its isolated 5000-task fixture.");
  test.setTimeout(120000);
  const external: string[] = [];
  await page.route("**/*", (route) => {
    if (route.request().url().startsWith("http://127.0.0.1:3100/")) return route.continue();
    external.push(route.request().url());
    return route.abort();
  });
  const warm: number[] = [];
  const save: number[] = [];
  const meters = page.getByRole("main");
  for (let run = 0; run < 25; run++) {
    const start = performance.now();
    await page.goto("/");
    await expect(meters.getByRole("heading", { name: "Ringkasan tugas" })).toBeVisible();
    if (run >= 5) warm.push(performance.now() - start);
  }
  await page.goto("/tasks");
  await page.getByRole("searchbox").fill("Benchmark task 4999");
  await expect(page.getByRole("button", { name: "Benchmark task 4999", exact: true })).toBeVisible();
  await page.goto("/priority");
  await expect(page.getByText("Tugas aktif diurutkan berdasarkan tenggat dan kesulitan.")).toBeVisible();
  await page.goto("/calendar");
  await expect(page.getByRole("region", { name: "Kalender tenggat" })).toBeVisible();
  await page.goto("/tasks");
  const add = page.getByRole("button", { name: "Tugas baru", exact: true }).first();
  for (let run = 0; run < 25; run++) {
    await add.click();
    const dialog = page.getByRole("dialog", { name: "Tugas baru" });
    const assigned = await dialog.getByLabel("Tanggal diberikan").inputValue();
    await dialog.getByLabel("Judul tugas").fill("Performance save " + run);
    await dialog.getByRole("radio", { name: "Nonakademik" }).check();
    await dialog.getByLabel("Kategori", { exact: true }).selectOption({ label: "Project" });
    await dialog.getByLabel("Tanggal tenggat").fill(assigned);
    const start = performance.now();
    await dialog.getByRole("button", { name: "Simpan", exact: true }).click();
    await expect(dialog).toBeHidden();
    if (run >= 5) save.push(performance.now() - start);
  }
  const result = { initialTasks: 5000, runs: 20, dashboardP95: p95(warm), saveP95: p95(save), externalRequests: external.length };
  mkdirSync(".work", { recursive: true });
  writeFileSync(".work/browser-benchmark.json", JSON.stringify(result, null, 2));
  console.log(result);
  expect(external).toEqual([]);
  expect(result.dashboardP95).toBeLessThanOrEqual(2000);
  expect(result.saveP95).toBeLessThanOrEqual(500);
});
