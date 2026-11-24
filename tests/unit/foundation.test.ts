import { describe, expect, it } from "vitest";
import { routes } from "@/components/shell/routes";

describe("T-03 workspace shell", () => {
  it("defines the eight unprefixed workspace routes", () => {
    expect(routes).toEqual(["/", "/tasks", "/priority", "/courses", "/categories", "/calendar", "/completed", "/settings"]);
  });
});
