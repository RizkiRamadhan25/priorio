import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { monthGrid, tasksByDay } from "@/domain/calendar";
import { rankTasks } from "@/domain/priority";
import { emptyFilters, filterTasks, latestCompleted, sortTasks } from "@/domain/search";
import { statistics } from "@/domain/statistics";
import type { Task } from "@/domain/types";
import { localInstant } from "@/lib/dates/local";
import { allowedMutation } from "@/server/security/origin";
import id from "@/i18n/messages/id.json";
import en from "@/i18n/messages/en.json";

const zone = "Asia/Jakarta";
const now = localInstant("2026-11-24", "10:00", zone);

function fixture(overrides: Partial<Task> = {}): Task {
  return { id: randomUUID(), title: "Academic Report", description: null, taskType: "ACADEMIC", courseId: "c",
    categoryId: null, assignedDate: "2026-11-20", dueDate: "2026-11-24", dueTime: null, difficultyLevel: 0,
    status: "TODO", notes: null, createdAt: "2026-11-20T00:00:00.000Z", updatedAt: "2026-11-20T00:00:00.000Z",
    completedAt: null, ...overrides };
}

describe("T-10–14 dashboard, search, calendar, preferences", () => {
  it("combines filter fields, normalizes Unicode search, and preserves rank order", () => {
    const report = fixture({ description: "  Ｌens experiments ", difficultyLevel: 5 });
    const tasks = [report, fixture({ title: "Lens", difficultyLevel: 1 }), fixture({ title: "Lens notes", courseId: "d", difficultyLevel: 5 })];
    expect(filterTasks(tasks, { ...emptyFilters, query: "lens", courses: ["c"], levels: [4, 5] }, now, zone)).toEqual([report]);
    expect(sortTasks(tasks, "title", "asc", now, zone).map(({ title }) => title)).toEqual(["Academic Report", "Lens", "Lens notes"]);
  });

  it("reconciles zero and populated dashboard totals and the seven-day inclusive window", () => {
    const include = fixture({ dueDate: "2026-11-30" });
    const exclude = fixture({ dueDate: "2026-12-01" });
    const overdue = fixture({ dueTime: "09:30" });
    const completed = fixture({ status: "COMPLETED", completedAt: "2026-11-24T03:00:00.000Z" });
    const data = { tasks: [include, exclude, overdue, completed], courses: [], categories: [], zone };
    expect(statistics(data, now)).toMatchObject({ total: 4, active: 3, overdue: 1, completed: 1, percentage: 25,
      upcoming: [include], status: { TODO: 3, IN_PROGRESS: 0, COMPLETED: 1 } });
    expect(statistics({ ...data, tasks: [] }, now)).toMatchObject({ total: 0, percentage: 0 });
    expect(latestCompleted(data.tasks)).toEqual([completed]);
  });

  it("lays out Monday-start leap months, year rollover and ordered day lists", () => {
    const grid = monthGrid("2028-02");
    expect(grid[0]).toBe("2028-01-31");
    expect(grid).toContain("2028-02-29");
    expect(monthGrid("2026-12")).toContain("2027-01-01");
    const timed = fixture({ dueTime: "00:00" });
    const noTime = fixture();
    const completed = fixture({ status: "COMPLETED", dueTime: "01:00" });
    expect(tasksByDay([noTime, completed, timed], true, false).get("2026-11-24")).toEqual([timed, noTime]);
    expect(tasksByDay([noTime, completed, timed], false, true).get("2026-11-24")).toEqual([completed]);
  });

  it("keeps ID/EN message keys in parity", () => {
    function keys(value: object): string[] {
      return Object.entries(value).flatMap(([key, child]) => typeof child === "string" ? key : keys(child).map((part) => key + "." + part));
    }
    expect(keys(id).sort()).toEqual(keys(en).sort());
  });
});

describe("T-16 loopback origin validation", () => {
  const host = "127.0.0.1:3100";
  it("accepts exact host and origin and rejects missing, external and forwarded hosts", () => {
    const headers = new Headers({ host, origin: "http://" + host });
    expect(allowedMutation(headers, "3100")).toBe(true);
    headers.set("x-forwarded-host", "other.example");
    expect(allowedMutation(headers, "3100")).toBe(false);
    headers.delete("x-forwarded-host");
    headers.set("origin", "https://other.example");
    expect(allowedMutation(headers, "3100")).toBe(false);
    headers.delete("origin");
    expect(allowedMutation(headers, "3100")).toBe(false);
    headers.set("origin", "http://" + host);
    headers.set("host", "localhost:3100");
    expect(allowedMutation(headers, "3100")).toBe(false);
  });
});

testRankPerformance();
function testRankPerformance() {
  it("T-18 ranks 1000 distinct deadlines with p95 at or below 200 ms", () => {
    const tasks = Array.from({ length: 1000 }, (_, index) => fixture({
      id: String(index), dueDate: `2026-11-${String(24 + index % 7).padStart(2, "0")}`,
      dueTime: `${String(Math.floor(index / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}`,
    }));
    for (let warm = 0; warm < 5; warm++) rankTasks(tasks, now, zone);
    const measurements = Array.from({ length: 30 }, () => {
      const start = performance.now();
      expect(rankTasks(tasks, now, zone)).toHaveLength(1000);
      return performance.now() - start;
    }).sort((a, b) => a - b);
    const p95 = measurements[Math.ceil(measurements.length * .95) - 1];
    console.log(`1000-task ranking p95: ${p95.toFixed(2)} ms (30 runs)`);
    expect(p95).toBeLessThanOrEqual(200);
  });
}
