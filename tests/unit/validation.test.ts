import { describe, expect, it } from "vitest";
import { completionTime, taskInput } from "@/domain/validation";
import { isLocalDate, localInstant } from "@/lib/dates/local";
import { normalize } from "@/lib/validation/normalization";

const task = {
  title: " Report ", taskType: "ACADEMIC", courseId: "47bac911-a2e4-4d8d-bb42-fbafe2d3b203", categoryId: null,
  assignedDate: "2026-11-01", dueDate: "2026-11-02", difficultyLevel: 0, status: "TODO",
};

describe("T-05 AC-003–008", () => {
  it.each([{title:"  "},{title:"a".repeat(151)},{dueDate:"2026-02-30"},{dueDate:"2026-10-31"},{dueTime:"24:00"},
    {difficultyLevel:6},{difficultyLevel:2.5},{difficultyLevel:"2"},{courseId:null},
    {categoryId:"47bac911-a2e4-4d8d-bb42-fbafe2d3b203"},{status:"unknown"}])("rejects invalid task fields %o", (override) => {
    expect(taskInput.safeParse({ ...task, ...override }).success).toBe(false);
  });

  it("accepts real leap and local times and normalizes names", () => {
    expect(taskInput.parse({ ...task, dueTime: "00:00" }).title).toBe("Report");
    expect(isLocalDate("2028-02-29")).toBe(true);
    expect(isLocalDate("2026-02-29")).toBe(false);
    expect(normalize("  Ｐersonal   Work  ")).toBe("personal work");
    expect(new Date(localInstant("2026-03-08", "02:30", "America/New_York")).toISOString()).toBe("2026-03-08T07:30:00.000Z");
    expect(new Date(localInstant("2026-11-01", "01:30", "America/New_York")).toISOString()).toBe("2026-11-01T05:30:00.000Z");
  });

  it("preserves completion on edit and clears it when reopening", () => {
    const original = new Date("2026-11-01T02:00Z");
    const now = new Date("2026-11-02T02:00Z");
    expect(completionTime("TODO", "COMPLETED", now)).toBe(now);
    expect(completionTime("COMPLETED", "COMPLETED", now, original)).toBe(original);
    expect(completionTime("COMPLETED", "TODO", now, original)).toBeNull();
  });
});
