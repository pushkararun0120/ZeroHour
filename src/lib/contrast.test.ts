import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
);

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Missing colour token: ${name}`);
  return match[1].toUpperCase();
}

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for identical colours", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
  });

  it("matches a known reference value", () => {
    expect(contrastRatio("#767676", "#FFFFFF")).toBeCloseTo(4.54, 1);
  });

  it("is the same whichever colour is the text", () => {
    expect(contrastRatio("#111827", "#F4F4F0")).toBeCloseTo(contrastRatio("#F4F4F0", "#111827"), 10);
  });

  it("rejects a colour that is not #RRGGBB", () => {
    expect(() => contrastRatio("red", "#FFFFFF")).toThrow();
  });
});

describe("design tokens", () => {
  it("match the blueprint palette", () => {
    expect(token("paper")).toBe("#F4F4F0");
    expect(token("surface")).toBe("#FFFFFF");
    expect(token("ink")).toBe("#111827");
    expect(token("line")).toBe("#D1D5DB");
    expect(token("crimson")).toBe("#B91C1C");
    expect(token("amber")).toBe("#B45309");
    expect(token("navy")).toBe("#1E3A8A");
  });

  const pairs: [string, string][] = [
    ["ink", "paper"],
    ["ink", "surface"],
    ["muted", "paper"],
    ["muted", "surface"],
    ["surface", "crimson"],
    ["surface", "amber"],
    ["surface", "navy"],
    ["surface", "ok"],
    ["amber", "surface"],
    ["crimson", "surface"],
    ["navy", "surface"],
    ["ok", "surface"],
    ["ink", "critical-tint"],
    ["ink", "warning-tint"],
    ["ink", "info-tint"],
    ["ink", "ok-tint"],
    ["navy", "info-tint"],
  ];

  it.each(pairs)("%s text on %s is at least 4.5:1", (foreground, background) => {
    expect(contrastRatio(token(foreground), token(background))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("stylesheet rules", () => {
  it("has no gradients, blur or text shadows", () => {
    expect(css).not.toMatch(/gradient|backdrop-filter|blur\(|text-shadow/i);
  });

  it("keeps a visible focus style and respects reduced motion", () => {
    expect(css).toMatch(/:focus-visible/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});