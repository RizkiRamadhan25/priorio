import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getDatabase } from "@/server/db";
import { archiveGroup, removeGroup, saveGroup } from "@/server/services/groups";
import { saveTask, changeTaskStatus, removeTask } from "@/server/services/tasks";
import { saveSettings } from "@/server/services/settings";
import { readSnapshot } from "@/server/repositories/snapshot";
import { testDatabase } from "../fixtures/database";

const fixture = testDatabase();
const previous = process.env.DATABASE_URL;
beforeAll(() => {
  fixture.migrate();
  process.env.DATABASE_URL = fixture.url;
}, 15000);
afterAll(async () => {
  if (process.env.DATABASE_URL === fixture.url) await getDatabase().$disconnect();
  if (previous) process.env.DATABASE_URL = previous;
  else delete process.env.DATABASE_URL;
  fixture.cleanup();
});

const base = { title: "Task", taskType: "ACADEMIC", assignedDate: "2026-11-24", dueDate: "2026-11-26", difficultyLevel: 3, status: "TODO" };

describe("T-06, T-07, T-08 group and task services", () => {
  it("validates archived assignments while keeping existing links, completion and counts", async () => {
    const course = await saveGroup("course", null, { name: " Physics ", color: "#6366F1", lecturer: "Rina" });
    const category = await saveGroup("category", null, { name: "Personal Work", color: "#64748B", description: "Notes" });
    await expect(saveGroup("category", null, { name: "Ｐersonal   WORK", color: "#64748B" })).rejects.toHaveProperty("code", "P2002");
    const task = await saveTask(null, { ...base, courseId: course });
    const nonAcademic = await saveTask(null, { ...base, taskType: "NONACADEMIC", categoryId: category });
    expect((await readSnapshot()).courses[0]).toMatchObject({ name: "Physics", count: 1, active: 1 });
    await expect(removeGroup("course", course)).rejects.toHaveProperty("code", "referenced");
    await archiveGroup("course", course, true);
    await expect(saveTask(null, { ...base, courseId: course })).rejects.toHaveProperty("code", "archived");
    await saveTask(task, { ...base, courseId: course, title: "Edited" });
    const finished = new Date("2026-11-25T08:00:00.000Z");
    await changeTaskStatus(task, "COMPLETED", () => finished);
    await saveTask(task, { ...base, courseId: course, status: "COMPLETED" });
    expect((await readSnapshot()).tasks.find(({ id }) => id === task)).toMatchObject({ status: "COMPLETED", completedAt: finished.toISOString() });
    await changeTaskStatus(task, "IN_PROGRESS");
    expect((await readSnapshot()).tasks.find(({ id }) => id === task)).toMatchObject({ completedAt: null, status: "IN_PROGRESS" });
    await archiveGroup("course", course, false);
    await saveGroup("course", course, { name: "Applied Physics", color: "#AA3344" });
    await archiveGroup("category", category, true);
    expect((await readSnapshot()).categories[0]).toMatchObject({ isArchived: true, count: 1 });
    await expect(removeGroup("category", category)).rejects.toHaveProperty("code", "referenced");
    await removeTask(task);
    await removeTask(nonAcademic);
    await removeGroup("course", course);
    await removeGroup("category", category);
    expect((await readSnapshot()).tasks).toEqual([]);
  });

  it("persists partial settings changes as a singleton", async () => {
    await saveSettings({ theme: "dark" });
    await saveSettings({ language: "en", sidebarCollapsed: true });
    expect((await readSnapshot()).settings).toEqual({ theme: "dark", language: "en", sidebarCollapsed: true });
  });
});
