import { describe, expect, it } from "vitest";
import { DEMO_SCENARIOS, buildDemoTriage } from "./demo-scenarios";
import { createIncident, patchIncident } from "./incident";
import { incidentSchema, triageResultSchema } from "./schemas";

const scenario = DEMO_SCENARIOS[0];
const validTriage = () => buildDemoTriage(scenario, "ZH-TEST");

describe("triageResultSchema", () => {
  it("accepts every demo scenario", () => {
    for (const s of DEMO_SCENARIOS) {
      const result = triageResultSchema.safeParse(buildDemoTriage(s, "ZH-TEST"));
      expect(result.success, s.id).toBe(true);
    }
  });

  it("rejects a priority that is not in the list", () => {
    const result = triageResultSchema.safeParse({ ...validTriage(), triage_priority: "ESI_9" });
    expect(result.success).toBe(false);
  });

  it("rejects a result with a missing section", () => {
    const broken = { ...validTriage() } as Record<string, unknown>;
    delete broken.first_aid_protocol;
    expect(triageResultSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects text that is far too long", () => {
    const result = triageResultSchema.safeParse({
      ...validTriage(),
      triage_rationale: "x".repeat(5000),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a value of the wrong type", () => {
    const triage = validTriage();
    const result = triageResultSchema.safeParse({
      ...triage,
      first_aid_protocol: { ...triage.first_aid_protocol, requires_cpr_metronome: "yes" },
    });
    expect(result.success).toBe(false);
  });
});

describe("incidentSchema", () => {
  const fresh = () => createIncident({ source: "synthetic-demo", id: "ZH-TEST" });

  it("accepts a new incident with no triage result", () => {
    expect(incidentSchema.safeParse(fresh()).success).toBe(true);
  });

  it("accepts an incident with a triage result, a location and a review mark", () => {
    const incident = patchIncident(
      fresh(),
      {
        triage: validTriage(),
        status: "active",
        location: { lat: 12.9249, lng: 80.1 },
        locationStatus: "granted",
        ocrReview: { 0: { confirmed: true } },
      },
      "Triage received",
    );
    expect(incidentSchema.safeParse(incident).success).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(incidentSchema.safeParse({ ...fresh(), status: "done" }).success).toBe(false);
  });

  it("rejects a date that is not a date", () => {
    expect(incidentSchema.safeParse({ ...fresh(), created_at: "yesterday-ish" }).success).toBe(false);
  });

  it("rejects coordinates outside the valid range", () => {
    const bad = { ...fresh(), location: { lat: 200, lng: 80 } };
    expect(incidentSchema.safeParse(bad).success).toBe(false);
  });
});