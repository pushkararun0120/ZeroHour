import { describe, expect, it } from "vitest";
import { SIMULATED_LABEL } from "./demo-scenarios";
import type { IncidentStatus } from "./incident";
import {
  categoryLabel,
  priorityLabel,
  priorityShort,
  priorityTone,
  sourceLabel,
  statusLabel,
} from "./labels";
import type { IncidentCategory, TriagePriority } from "./triage-schema";

const PRIORITIES: TriagePriority[] = ["ESI_1_RESUSCITATION", "ESI_2_EMERGENT", "ESI_3_URGENT"];
const CATEGORIES: IncidentCategory[] = [
  "CARDIAC_EMERGENCY",
  "ROAD_POLYTRAUMA",
  "ELECTRICAL_CIVIC_HAZARD",
  "STROKE_NEURO",
  "RESPIRATORY_MEDICAL",
  "OTHER_OR_UNCLEAR",
];
const STATUSES: IncidentStatus[] = ["capturing", "processing", "active", "completed", "error"];

describe("labels", () => {
  it("names every priority", () => {
    expect(priorityShort("ESI_1_RESUSCITATION")).toBe("ESI 1");
    expect(priorityLabel("ESI_2_EMERGENT")).toBe("ESI 2: Emergent");
    expect(priorityLabel("ESI_3_URGENT")).toBe("ESI 3: Urgent");
  });

  it("has a readable label for every category and status", () => {
    for (const category of CATEGORIES) expect(categoryLabel(category).length).toBeGreaterThan(3);
    for (const status of STATUSES) expect(statusLabel(status).length).toBeGreaterThan(3);
  });

  it("keeps labels free of emoji and em dashes", () => {
    const all = [
      ...PRIORITIES.map(priorityLabel),
      ...CATEGORIES.map(categoryLabel),
      ...STATUSES.map(statusLabel),
      sourceLabel("live-gemini"),
      sourceLabel("synthetic-demo"),
    ];
    for (const text of all) {
      expect(text).not.toMatch(/\u2014/);
      expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  it("uses the same simulated label as the demo scenarios", () => {
    expect(sourceLabel("synthetic-demo")).toBe(SIMULATED_LABEL);
    expect(sourceLabel("live-gemini")).toBe("Live (Gemini)");
  });
});

describe("priorityTone", () => {
  it("gives each priority its own fixed tone", () => {
    expect(priorityTone("ESI_1_RESUSCITATION")).toBe("critical");
    expect(priorityTone("ESI_2_EMERGENT")).toBe("emergent");
    expect(priorityTone("ESI_3_URGENT")).toBe("urgent");
  });

  it("is pending when there is no triage result yet", () => {
    expect(priorityTone(null)).toBe("pending");
    expect(priorityTone(undefined)).toBe("pending");
  });
});