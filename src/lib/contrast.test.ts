import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

const css = readFileSync(
  fileURLToPath(new URL("../app/globals.css", import.meta.url)),
  "utf8",
);

function token(name: string): string {
  const match = css.match(new RegExp(`--zh-${name}:\\s*(#[0-9a-fA-F]{6})`));
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
  it("keep the blueprint palette", () => {
    expect(token("paper")).toBe("#F4F4F0");
    expect(token("surface")).toBe("#FFFFFF");
    expect(token("text")).toBe("#111827");
    expect(token("border")).toBe("#D1D5DB");
    expect(token("critical")).toBe("#B91C1C");
    expect(token("urgent")).toBe("#B45309");
    expect(token("navy")).toBe("#1E3A8A");
  });

  it("use the Calm Clinical primary colour", () => {
    expect(token("primary")).toBe("#315C5D");
  });

  const textPairs: [string, string][] = [
    ["text", "paper"],
    ["text", "surface"],
    ["text-secondary", "paper"],
    ["text-secondary", "surface"],
    ["text-secondary", "primary-soft"],
    ["surface", "primary"],
    ["surface", "primary-hover"],
    ["primary", "surface"],
    ["primary", "primary-soft"],
    ["surface", "critical"],
    ["surface", "urgent"],
    ["critical-text", "critical-bg"],
    ["urgent-text", "urgent-bg"],
    ["info-text", "info-bg"],
    ["navy", "surface"],
    ["navy", "info-bg"],
    ["success", "surface"],
    ["success", "success-bg"],
    ["neutral-text", "neutral-bg"],
    ["disabled-text", "disabled-bg"],
    ["text", "primary-soft"],
    ["text", "critical-bg"],
    ["text", "urgent-bg"],
    ["text", "info-bg"],
    ["text", "success-bg"],
    ["text", "neutral-bg"],
  ];

  it.each(textPairs)("%s text on %s is at least 4.5:1", (foreground, background) => {
    expect(contrastRatio(token(foreground), token(background))).toBeGreaterThanOrEqual(4.5);
  });

  it.each([["surface"], ["paper"]])("the focus colour is at least 3:1 on %s", (background) => {
    expect(contrastRatio(token("focus"), token(background))).toBeGreaterThanOrEqual(3);
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