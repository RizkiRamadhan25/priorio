import { expect, test } from "@playwright/test";

test("PE-24 priority responds to deadline, level updates and a running clock", async ({ page }) => {
  await page.clock.install({ time: new Date(2060, 4, 1, 9, 58, 0) });
  await page.goto("/priority");
  await page.getByRole("button", { name: "Tugas baru", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  const title = "Perubahan prioritas";
  await dialog.getByLabel("Judul tugas").fill(title);
  await dialog.getByRole("radio", { name: "Nonakademik" }).check();
  await dialog.getByLabel("Kategori", { exact: true }).selectOption({ label: "Personal" });
  await dialog.getByLabel("Tanggal diberikan").fill("2060-05-01");
  await dialog.getByLabel("Tanggal tenggat").fill("2060-05-01");
  await dialog.getByLabel("Jam tenggat (opsional)").fill("10:00");
  await dialog.getByRole("radio", { name: "L4 Sulit", exact: true }).check();
  await dialog.getByRole("button", { name: "Simpan", exact: true }).click();
  const row = page.getByRole("listitem").filter({ hasText: title });
  await expect(row).toContainText("92");
  await page.clock.fastForward(3 * 60_000);
  await expect(row).toContainText("112");
  await expect(row).toContainText("Terlambat");

  await row.getByRole("button", { name: title, exact: true }).click();
  await dialog.getByRole("button", { name: "Edit", exact: true }).click();
  await dialog.getByLabel("Jam tenggat (opsional)").fill("22:00");
  await dialog.getByRole("radio", { name: "L0 Sangat mudah", exact: true }).check();
  await dialog.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(row).toContainText("80");
  await expect(row).toContainText("Hari ini");

  await row.getByRole("button", { name: title, exact: true }).click();
  await dialog.getByRole("button", { name: "Hapus", exact: true }).click();
  await page.getByRole("dialog", { name: "Hapus " + title + "?" }).getByRole("button", { name: "Hapus", exact: true }).click();
  await expect(row).toBeHidden();
});
