import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

function channels(hex: string) {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
}

function luminance(rgb: number[]) {
  const [r, g, b] = rgb.map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
}

const tokens = readFileSync("src/app/globals.css", "utf8");
it("V-NFR-026 meets 4.5:1 for content, buttons and status text in both themes", () => {
  for (const selector of [":root", '[data-theme="dark"]']) {
    const body = tokens.split(selector)[1].split("}")[0];
    const colors = Object.fromEntries(Array.from(body.matchAll(/--([a-z-]+): (#[a-f\d]{6});/giu),
      ([, key, value]) => [key, channels(value)]));
    function ratio(foreground: string, background: string, tint = 0) {
      const fg = luminance(colors[foreground]);
      const bg = luminance(colors[background].map((value, index) => (1 - tint) * value + tint * colors[foreground][index]));
      return (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05);
    }
    for (const key of ["text", "text-muted"]) {
      for (const background of ["background", "surface", "surface-muted"]) {
        expect(ratio(key, background), `${selector} ${key} on ${background}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    for (const status of ["primary", "info", "success", "warning", "danger"]) {
      expect(ratio(status, "surface", .11), `${selector} ${status} tint`).toBeGreaterThanOrEqual(4.5);
    }
    expect(ratio("primary-foreground", "primary")).toBeGreaterThanOrEqual(4.5);
    expect(ratio("surface", "danger")).toBeGreaterThanOrEqual(4.5);
  }
});
