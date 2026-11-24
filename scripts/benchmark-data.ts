import { createDatabase } from "../src/server/db/client";
import { addDays, localDate } from "../src/lib/dates/local";

if (process.env.PRIORIO_PORT !== "3100" || !process.env.DATABASE_URL) throw new Error("Benchmark requires an isolated database.");
const database = createDatabase();
async function populate() {
  const category = await database.category.findUniqueOrThrow({ where: { nameKey: "project" } });
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = localDate(Date.now(), zone);
  for (let offset = 0; offset < 5000; offset += 250) {
    await database.task.createMany({ data: Array.from({ length: 250 }, (_, index) => {
      const number = index + offset;
      const completed = number % 4 === 0;
      return {
        title: "Benchmark task " + number,
        description: "Benchmark fixture for local performance measurement.",
        taskType: "NONACADEMIC", categoryId: category.id, assignedDate: today,
        dueDate: addDays(today, number % 60), dueTime: `${String(number % 24).padStart(2, "0")}:${String(number % 60).padStart(2, "0")}`,
        difficultyLevel: number % 6, status: completed ? "COMPLETED" : number % 3 === 0 ? "IN_PROGRESS" : "TODO",
        completedAt: completed ? new Date() : null,
      };
    }) });
  }
}
populate().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => database.$disconnect());
