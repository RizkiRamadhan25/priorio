import { describe, expect, it } from "vitest";
import { nextBoundary, rankTasks } from "@/domain/priority";
import { localInstant } from "@/lib/dates/local";
import type { Task } from "@/domain/types";

const zone = "Asia/Jakarta";
const now = localInstant("2026-11-24", "10:00", zone);
const task = (dueDate: string, difficultyLevel: number, options: Partial<Task> = {}): Task => ({
  id: "1", title: "Task", description: null, notes: null, taskType: "ACADEMIC", courseId: "c",
  categoryId: null, assignedDate: "2026-11-01", dueDate, dueTime: null, difficultyLevel, status: "TODO",
  createdAt: "2026-11-01T01:00:00.000Z", updatedAt: "2026-11-01T01:00:00.000Z", completedAt: null, ...options,
});

describe("T-09 PE-01–24", () => {
  it.each([["23", 5, 115], ["23", 0, 100], ["24", 5, 95], ["24", 0, 80], ["25", 5, 75], ["25", 0, 60],
    ["26", 4, 52], ["27", 1, 43], ["28", 3, 29], ["31", 5, 35]])("scores due fixture %s at L%s", (day, level, score) => {
    expect(rankTasks([task(day === "31" ? "2026-12-01" : "2026-11-" + day, level)], now, zone)[0].score).toBe(score);
  });

  it("handles later deadlines, overdue time, completed tasks and urgency dominance", () => {
    const fromLater = [task("2026-12-02", 5), task("2026-12-24", 0)];
    expect(rankTasks(fromLater, now, zone).map((entry) => entry.score)).toEqual([15, 0]);
    const tasks = [task("2026-11-24", 3, { dueTime: "09:00" }), task("2026-11-24", 5),
      task("2026-11-23", 5, { status: "COMPLETED" })];
    expect(rankTasks(tasks, now, zone).map((item) => item.score)).toEqual([109, 95]);
  });

  it("breaks ties by deadline, creation time and identifier", () => {
    const tasks = [
      task("2026-11-24", 0, { id: "a" }),
      task("2026-11-24", 0, { id: "z", dueTime: "11:00" }),
      task("2026-11-24", 0, { id: "c", dueTime: "11:00", createdAt: "2026-11-01T00:00:00.000Z" }),
      task("2026-11-24", 0, { id: "b", dueTime: "11:00", createdAt: "2026-11-01T00:00:00.000Z" }),
    ];
    expect(rankTasks(tasks, now, zone).map(({ task }) => task.id)).toEqual(["b", "c", "z", "a"]);
  });

  it("recomputes at the exact overdue offset and local midnight, including DST", () => {
    const exact = task("2026-11-24", 0, { dueTime: "10:00" });
    expect(rankTasks([exact], now, zone)[0].bucket).toBe("today");
    expect(nextBoundary([exact], now, zone)).toBe(now + 1);
    expect(rankTasks([exact], now + 1, zone)[0].bucket).toBe("overdue");
    const midnight = localInstant("2026-11-25", "00:00", zone);
    expect(rankTasks([task("2026-11-24", 0)], midnight - 1, zone)[0].bucket).toBe("today");
    expect(rankTasks([task("2026-11-24", 0)], midnight, zone)[0].bucket).toBe("overdue");
    const ny = "America/New_York";
    expect(rankTasks([task("2026-03-09", 0)], localInstant("2026-03-08", "00:00", ny), ny)[0].bucket).toBe("tomorrow");
  });
});
