import { createDatabase } from "../../src/server/db/client";
import { seedDefaults } from "../../src/server/db/defaults";

if (process.env.PRIORIO_PORT !== "3101" || !process.env.DATABASE_URL) throw new Error("Restart fixture requires an isolated database.");
const database = createDatabase();
async function populate() {
  await seedDefaults(database);
  const group = await database.category.findUniqueOrThrow({ where: { nameKey: "personal" } });
  await database.task.create({ data: { title: "Persisted fixture", categoryId: group.id, taskType: "NONACADEMIC",
    assignedDate: "2026-11-24", dueDate: "2026-11-25" } });
  await database.appSettings.update({ where: { id: 1 }, data: { theme: "dark", language: "en", sidebarCollapsed: true } });
}
populate().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => database.$disconnect());
