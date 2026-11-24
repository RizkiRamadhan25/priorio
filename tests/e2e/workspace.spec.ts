import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const date = "2030-01-22";

async function goto(page: Page, label: string) {
  await page.getByRole("navigation").getByRole("link", { name: label, exact: true }).click();
}

test("AC-001,003,014,015,016,018,025,026: group and task CRUD, priority and search", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => { if (!request.url().startsWith("http://127.0.0.1:3100/")) external.push(request.url()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Ringkasan tugas" })).toBeVisible();
  await expect(page.getByText("0 dari 0 tugas selesai")).toBeVisible();
  await goto(page, "Mata kuliah");
  await page.getByRole("button", { name: "Tambah mata kuliah", exact: true }).first().click();
  await page.getByLabel("Nama", { exact: true }).fill("Fisika Uji");
  await page.getByLabel("Kode mata kuliah").fill("PHY101");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Fisika Uji" })).toBeVisible();
  await page.getByRole("button", { name: "Tugas baru", exact: true }).first().click();
  const form = page.getByRole("dialog", { name: "Tugas baru" });
  await form.getByLabel("Mata kuliah", { exact: true }).selectOption({ label: "Fisika Uji" });
  await form.getByLabel("Tanggal tenggat").fill(date);
  await form.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(form.getByText("Isian ini wajib diisi.")).toBeVisible();
  await form.getByLabel("Judul tugas").fill("<script>window.bad=1</script>");
  await form.getByRole("radio", { name: "L5 Sangat sulit" }).check();
  await form.getByText("Deskripsi dan catatan (opsional)").click();
  await form.getByLabel("Deskripsi", { exact: true }).fill("Eksperimen Lensa");
  await form.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(form).toBeHidden();
  await expect(page.getByText("1 aktif dari 1 tugas")).toBeVisible();
  await page.getByRole("button", { name: "Hapus", exact: true }).click();
  let confirmation = page.getByRole("dialog", { name: "Hapus Fisika Uji?" });
  await confirmation.getByRole("button", { name: "Hapus", exact: true }).click();
  await expect(confirmation.getByRole("alert")).toContainText("Kelompok masih memiliki tugas");
  await confirmation.getByRole("button", { name: "Batal" }).click();
  await page.getByRole("button", { name: "Arsipkan" }).click();
  await expect(page.getByRole("heading", { name: "Fisika Uji" })).toBeHidden();
  await page.getByLabel("Tampilkan arsip").check();
  await expect(page.getByRole("heading", { name: "Fisika Uji" })).toBeVisible();
  await page.getByRole("link", { name: "Lihat tugas", exact: true }).click();
  await expect(page.getByText("1 tugas", { exact: true })).toBeVisible();
  await page.getByRole("searchbox", { name: "Cari tugas" }).fill("EKSPERIMEN");
  await page.getByRole("checkbox", { name: "Akademik", exact: true }).check();
  await expect(page.getByRole("button", { name: "<script>window.bad=1</script>", exact: true })).toBeVisible();
  expect(await page.evaluate(() => Object.hasOwn(window, "bad"))).toBe(false);
  await goto(page, "Prioritas");
  await page.getByRole("button", { name: "<script>window.bad=1</script>", exact: true }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Judul tugas").fill("Praktikum Cahaya");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page.getByRole("button", { name: "Praktikum Cahaya", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Praktikum Cahaya", exact: true }).click();
  await page.getByRole("button", { name: "Tandai selesai" }).click();
  await expect(page.getByText("Tidak ada tugas aktif", { exact: true })).toBeVisible();
  await goto(page, "Selesai");
  await page.getByRole("button", { name: "Praktikum Cahaya", exact: true }).click();
  await page.getByRole("button", { name: "Buka kembali", exact: true }).click();
  await page.getByRole("dialog", { name: "Buka kembali Praktikum Cahaya" }).getByRole("button", { name: "Sedang dikerjakan" }).click();
  await goto(page, "Prioritas");
  await page.getByRole("button", { name: "Praktikum Cahaya", exact: true }).click();
  await page.getByRole("button", { name: "Hapus", exact: true }).click();
  confirmation = page.getByRole("dialog", { name: "Hapus Praktikum Cahaya?" });
  await confirmation.getByRole("button", { name: "Batal" }).click();
  await expect(page.getByRole("dialog", { name: "Detail tugas" })).toBeVisible();
  await page.getByRole("button", { name: "Hapus", exact: true }).click();
  await confirmation.getByRole("button", { name: "Hapus", exact: true }).click();
  await expect(page.getByText("Tidak ada tugas aktif", { exact: true })).toBeVisible();
  expect(external).toEqual([]);
});

test("AC-002,017,024: calendar date, nested group draft, and failed save recovery", async ({ page }) => {
  await page.goto("/calendar");
  await page.getByLabel("Bulan", { exact: true }).selectOption("01");
  await page.getByLabel("Tahun", { exact: true }).fill("2030");
  await page.getByLabel("Tahun", { exact: true }).press("Enter");
  await page.getByRole("button", { name: /22 Januari 2030/ }).click();
  await expect(page.getByRole("region", { name: "Tugas pada 22 Januari 2030" })).toBeVisible();
  await page.getByRole("main").getByRole("button", { name: "Tugas baru", exact: true }).first().click();
  const form = page.getByRole("dialog", { name: "Tugas baru" });
  await expect(form.getByLabel("Tanggal tenggat")).toHaveValue(date);
  await form.getByLabel("Judul tugas").fill("Siapkan acara");
  await form.getByRole("radio", { name: "Nonakademik" }).check();
  await form.getByRole("button", { name: "Tambah kategori" }).click();
  const group = page.getByRole("dialog", { name: "Tambah kategori" });
  await group.getByLabel("Nama").fill("Acara");
  await group.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(group).toBeHidden();
  await expect(form.getByLabel("Judul tugas")).toHaveValue("Siapkan acara");
  await expect(form.getByLabel("Kategori", { exact: true }).locator("option:checked")).toHaveText("Acara");
  await page.route("**/calendar", (route) => route.request().method() === "POST" ? route.abort() : route.continue());
  await form.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText("Perubahan gagal disimpan");
  await expect(form.getByLabel("Judul tugas")).toHaveValue("Siapkan acara");
  await page.unroute("**/calendar");
  await form.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page.getByRole("button", { name: "Siapkan acara", exact: true })).toBeVisible();
});

test("AC-019,020,022: preferences are instant and all routes fit across viewport sizes", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/settings");
  await page.evaluate(() => { Object.assign(window, { priorioSession: "alive" }); });
  await page.getByRole("radio", { name: "Gelap", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("radio", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  expect(await page.evaluate(() => Reflect.get(window, "priorioSession"))).toBe("alive");
  await page.getByLabel("Desktop sidebar").click();
  await expect(page.locator(".app-shell")).toHaveClass(/is-collapsed/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".app-shell")).toHaveClass(/is-collapsed/);
  for (const [theme, language] of [["dark", "id"], ["light", "id"], ["light", "en"], ["dark", "en"]]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/settings");
    const html = page.locator("html");
    if (await html.getAttribute("data-theme") !== theme) {
      await page.locator('input[name="theme"]').nth(theme === "dark" ? 1 : 0).click();
      await expect(html).toHaveAttribute("data-theme", theme);
    }
    if (await html.getAttribute("lang") !== language) {
      await page.locator('input[name="language"]').nth(language === "en" ? 1 : 0).click();
      await expect(html).toHaveAttribute("lang", language);
    }
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ["/", "/tasks", "/priority", "/courses", "/categories", "/calendar", "/completed", "/settings"]) {
        await page.goto(route);
        await expect(page.locator("main h1")).toBeVisible();
        await expect(html).toHaveAttribute("data-theme", theme);
        await expect(html).toHaveAttribute("lang", language);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    }
  }
  await page.setViewportSize({ width: 320, height: 760 });
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(page.getByRole("dialog", { name: "Priorio" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await page.getByRole("button", { name: "New task", exact: true }).first().click();
  await page.getByLabel("Task title").fill("Unsaved");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Discard changes?" })).toBeVisible();
  await page.getByRole("button", { name: "Discard changes", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
