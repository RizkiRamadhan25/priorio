import { expect, test } from "@playwright/test";

test("T-16 denies cross-origin, missing-origin and foreign Host mutations", async ({ page, request }) => {
  await page.goto("/settings");
  const before = await page.locator("html").getAttribute("data-theme");
  const expected = before === "dark" ? "light" : "dark";
  await page.route("**/settings", (route) => route.request().method() === "POST" ? route.abort() : route.continue());
  const outgoing = page.waitForRequest((candidate) => candidate.method() === "POST" && candidate.url().endsWith("/settings"));
  await page.getByRole("button", { name: before === "dark" ? "Aktifkan tema terang" : "Aktifkan tema gelap" }).click();
  const mutation = await outgoing;
  const data = mutation.postDataBuffer();
  const original = mutation.headers();
  expect(data).not.toBeNull();
  expect(original["next-action"]).toBeTruthy();
  if (!data) throw new Error("No form payload captured.");
  const headers = { "next-action": original["next-action"], "content-type": original["content-type"], accept: "text/x-component" };
  const invalidHeaders: Record<string, string>[] = [
    { origin: "https://unrelated.example" }, {}, { host: "unrelated.example", origin: "http://127.0.0.1:3100" },
  ];
  for (const extra of invalidHeaders) {
    await request.post("/settings", { data, headers: { ...headers, ...extra }, failOnStatusCode: false });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", before ?? "light");
  }
  await page.unroute("**/settings");
  await page.getByRole("button", { name: before === "dark" ? "Aktifkan tema terang" : "Aktifkan tema gelap" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", expected);
  await page.getByRole("button", { name: before === "dark" ? "Aktifkan tema gelap" : "Aktifkan tema terang" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", before ?? "light");
  expect((await request.get("/data/priorio.db")).status()).toBe(404);
});
