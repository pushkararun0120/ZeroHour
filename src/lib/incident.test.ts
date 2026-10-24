import { describe, expect, it } from "vitest";
import {
  createIncident,
  createIncidentId,
  elapsedSeconds,
  formatElapsed,
  patchIncident,
  sortQueue,
} from "./incident";
import type { TriagePriority, ZeroHourTriageResult } from "./triage-schema";

describe("createIncidentId", () => {
  it("builds a readable ID from the time and four letters or digits", () => {
    const id = createIncidentId(new Date("2026-10-24T11:45:33Z"), () => 0);
    expect(id).toBe("ZH-20261024-114533-AAAA");
  });

  it("matches the expected format with real randomness", () => {
    expect(createIncidentId()).toMatch(/^ZH-\d{8}-\d{6}-[A-Z2-9]{4}$/);
  });
});

describe("createIncident", () => {
  it("starts in the capturing state with a creation event", () => {
    const now = new Date("2026-10-24T11:45:33Z");
    const incident = createIncident({ source: "synthetic-demo", now });
    expect(incident.status).toBe("capturing");
    expect(incident.source).toBe("synthetic-demo");
    expect(incident.created_at).toBe(now.toISOString());
    expect(incident.triage).toBeNull();
    expect(incident.location).toBeNull();
    expect(incident.events).toHaveLength(1);
  });
});

describe("patchIncident", () => {
  const start = new Date("2026-10-24T11:45:33Z");
  const later = new Date("2026-10-24T11:50:00Z");

  it("keeps the ID and creation time and updates the rest", () => {
    const original = createIncident({ source: "live-gemini", id: "ZH-TEST", now: start });
    const patched = patchIncident(original, { status: "active" }, "Triage received", later);
    expect(patched.incident_id).toBe("ZH-TEST");
    expect(patched.created_at).toBe(original.created_at);
    expect(patched.updated_at).toBe(later.toISOString());
    expect(patched.status).toBe("active");
    expect(patched.events.at(-1)?.message).toBe("Triage received");
  });

  it("does not change the original object", () => {
    const original = createIncident({ source: "live-gemini", now: start });
    patchIncident(original, { status: "active" }, "Triage received", later);
    expect(original.status).toBe("capturing");
    expect(original.events).toHaveLength(1);
  });

  it("adds no event when no message is given", () => {
    const original = createIncident({ source: "live-gemini", now: start });
    const patched = patchIncident(original, { status: "processing" }, undefined, later);
    expect(patched.events).toHaveLength(1);
  });
});

describe("sortQueue", () => {
  function make(id: string, priority: TriagePriority | null, updatedAt: string) {
    const base = createIncident({ source: "synthetic-demo", id, now: new Date(updatedAt) });
    return {
      ...base,
      updated_at: updatedAt,
      triage: priority
        ? ({ triage_priority: priority } as ZeroHourTriageResult)
        : null,
    };
  }

  it("sorts by priority, then newest first, with unassessed incidents last", () => {
    const a = make("a", "ESI_2_EMERGENT", "2026-10-24T10:00:00Z");
    const b = make("b", "ESI_1_RESUSCITATION", "2026-10-24T09:00:00Z");
    const c = make("c", "ESI_2_EMERGENT", "2026-10-24T11:00:00Z");
    const d = make("d", null, "2026-10-24T12:00:00Z");
    const sorted = sortQueue([a, b, c, d]);
    expect(sorted.map((i) => i.incident_id)).toEqual(["b", "c", "a", "d"]);
  });

  it("does not reorder the array that was passed in", () => {
    const a = make("a", "ESI_3_URGENT", "2026-10-24T10:00:00Z");
    const b = make("b", "ESI_1_RESUSCITATION", "2026-10-24T09:00:00Z");
    const input = [a, b];
    sortQueue(input);
    expect(input.map((i) => i.incident_id)).toEqual(["a", "b"]);
  });
});

describe("golden hour timer", () => {
  it("counts whole seconds since the start", () => {
    const start = "2026-10-24T11:00:00.000Z";
    const now = Date.parse("2026-10-24T11:01:05.900Z");
    expect(elapsedSeconds(start, now)).toBe(65);
  });

  it("never goes negative or breaks on a bad date", () => {
    expect(elapsedSeconds("2026-10-24T11:00:00Z", Date.parse("2026-10-24T10:00:00Z"))).toBe(0);
    expect(elapsedSeconds("not a date", Date.now())).toBe(0);
  });

  it("formats seconds as T+ hh:mm:ss", () => {
    expect(formatElapsed(0)).toBe("T+ 00:00:00");
    expect(formatElapsed(3661)).toBe("T+ 01:01:01");
    expect(formatElapsed(-5)).toBe("T+ 00:00:00");
    expect(formatElapsed(360000)).toBe("T+ 100:00:00");
  });
});