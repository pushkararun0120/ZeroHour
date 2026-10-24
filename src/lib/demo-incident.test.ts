import { describe, expect, it } from "vitest";
import { DEMO_SCENARIOS, getDemoScenario } from "./demo-scenarios";
import { startDemoIncident } from "./demo-incident";
import { incidentSchema } from "./schemas";

const NOW = new Date("2026-10-24T11:00:00Z");

describe("startDemoIncident", () => {
  it("creates an active, simulated incident that starts the timer now", () => {
    const incident = startDemoIncident(getDemoScenario("tamil-cardiac")!, NOW);
    expect(incident.source).toBe("synthetic-demo");
    expect(incident.status).toBe("active");
    expect(incident.created_at).toBe(NOW.toISOString());
    expect(incident.triage?.incident_id).toBe(incident.incident_id);
  });

  it("does not claim a device location or a Gemini request", () => {
    const incident = startDemoIncident(getDemoScenario("hindi-polytrauma")!, NOW);
    expect(incident.location).toBeNull();
    expect(incident.locationStatus).toBe("unavailable");
    expect(incident.events.at(-1)?.message).toMatch(/no gemini request was made/i);
  });

  it("produces a valid incident for every scenario", () => {
    for (const scenario of DEMO_SCENARIOS) {
      expect(incidentSchema.safeParse(startDemoIncident(scenario, NOW)).success, scenario.id).toBe(
        true,
      );
    }
  });
});