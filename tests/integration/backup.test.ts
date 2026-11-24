import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { createDatabase } from "@/server/db/client";
import { seedDefaults } from "@/server/db/defaults";
import { testDatabase } from "../fixtures/database";

it("T-19 backs up a stopped SQLite fixture and restores records and preferences", async () => {
  const fixture = testDatabase();
  try {
    fixture.migrate();
    const source = createDatabase(fixture.url);
    let taskId = "";
    try {
      await seedDefaults(source);
      const category = await source.category.findUniqueOrThrow({ where: { nameKey: "personal" } });
      const task = await source.task.create({ data: { title: "Restore fixture", taskType: "NONACADEMIC",
        categoryId: category.id, assignedDate: "2026-11-24", dueDate: "2026-11-25" } });
      taskId = task.id;
      await source.appSettings.update({ where: { id: 1 }, data: { theme: "dark", language: "en", sidebarCollapsed: true } });
      await source.$queryRaw`PRAGMA wal_checkpoint(TRUNCATE)`;
    } finally {
      await source.$disconnect();
    }
    expect(existsSync(fixture.path + "-wal")).toBe(false);
    const snapshot = join(fixture.directory, "backup.sqlite");
    const restored = join(fixture.directory, "restored.sqlite");
    copyFileSync(fixture.path, snapshot);
    copyFileSync(snapshot, restored);
    const client = createDatabase("file:" + restored.replaceAll("\\", "/"));
    try {
      expect(await client.$queryRaw`PRAGMA integrity_check`).toEqual([{ integrity_check: "ok" }]);
      expect(await client.task.findUniqueOrThrow({ where: { id: taskId } })).toHaveProperty("title", "Restore fixture");
      expect(await client.category.count()).toBe(4);
      expect(await client.appSettings.findUniqueOrThrow({ where: { id: 1 } })).toMatchObject({
        theme: "dark", language: "en", sidebarCollapsed: true,
      });
    } finally {
      await client.$disconnect();
    }
  } finally {
    fixture.cleanup();
  }
}, 15000);
