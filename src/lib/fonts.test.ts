import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
const layout = read("../app/layout.tsx");
const css = read("../app/globals.css");

const FAMILIES = [
  "Noto_Sans",
  "Noto_Sans_Tamil",
  "Noto_Sans_Devanagari",
  "Noto_Sans_Telugu",
  "Noto_Sans_Malayalam",
];

describe("fonts", () => {
  it.each(FAMILIES)("%s is created in layout.tsx", (family) => {
    expect(layout).toContain(`${family}(`);
  });

  it("uses every font variable in the font list in globals.css", () => {
    const variables = [...layout.matchAll(/variable:\s*"(--[\w-]+)"/g)].map((m) => m[1]);
    expect(variables).toHaveLength(FAMILIES.length);
    for (const variable of variables) {
      expect(css).toContain(`var(${variable})`);
    }
  });

  it("adds every font's class to the html element", () => {
    const names = [...layout.matchAll(/const\s+(\w+)\s*=\s*Noto_Sans\w*\(/g)].map((m) => m[1]);
    expect(names).toHaveLength(FAMILIES.length);
    for (const name of names) {
      expect(layout).toContain(`${name}.variable`);
    }
  });
});