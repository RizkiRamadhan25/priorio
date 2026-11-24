import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabase } from "@/server/db/client";
import { seedDefaults } from "@/server/db/defaults";
import { databaseLocation } from "@/lib/env/database";
import { testDatabase } from "../fixtures/database";

const fixture = testDatabase();
const client = createDatabase(fixture.url);
beforeAll(() => fixture.migrate(), 15000);
afterAll(async () => { await client.$disconnect(); fixture.cleanup(); });

describe("T-04 SQLite V-FR-090–096", () => {
  it("shares the resolved CLI/runtime database and rejects public paths", async () => {
    expect(databaseLocation(fixture.url).path).toBe(fixture.path);
    expect(() => databaseLocation("file:./public/priorio.db")).toThrow("outside the public");
    expect(Number((await client.$queryRaw<Array<{ foreign_keys: number }>>`PRAGMA foreign_keys`)[0].foreign_keys)).toBe(1);
    expect(await client.appSettings.count()).toBe(1);
    await expect(client.appSettings.create({ data: { id: 2 } })).rejects.toThrow();
  });

  it("enforces FK, XOR, difficulty and completion constraints", async () => {
    const course = await client.course.create({ data: { name: "Course", nameKey: "course" } });
    const data = { title: "Fixture", assignedDate: "2026-11-01", dueDate: "2026-11-02", taskType: "ACADEMIC" };
    await expect(client.task.create({ data: { ...data, courseId: "missing" } })).rejects.toThrow();
    await expect(client.task.create({ data })).rejects.toThrow();
    await expect(client.task.create({ data: { ...data, courseId: course.id, difficultyLevel: 6 } })).rejects.toThrow();
    await expect(client.task.create({ data: { ...data, courseId: course.id, status: "COMPLETED" } })).rejects.toThrow();
    await client.task.create({ data: { ...data, courseId: course.id } });
    await expect(client.course.delete({ where: { id: course.id } })).rejects.toThrow();
    const reopened = createDatabase(fixture.url);
    try { expect(await reopened.task.count()).toBe(1); }
    finally { await reopened.$disconnect(); }
  });

  it("seeds once and preserves a deliberately removed default", async () => {
    await seedDefaults(client);
    expect(await client.category.count()).toBe(4);
    await client.category.delete({ where: { nameKey: "personal" } });
    await seedDefaults(client);
    expect(await client.category.count()).toBe(3);
  });
});
