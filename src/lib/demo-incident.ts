import { buildDemoTriage, type DemoScenario } from "./demo-scenarios";
import { createIncident, patchIncident, type Incident } from "./incident";

/**
 * Builds an incident from a simulated scenario. The source is always
 * "synthetic-demo", and the event log says that no Gemini request was made.
 */
export function startDemoIncident(scenario: DemoScenario, now: Date = new Date()): Incident {
  const created = createIncident({ source: "synthetic-demo", now });
  return patchIncident(
    created,
    {
      triage: buildDemoTriage(scenario, created.incident_id),
      status: "active",
      locationStatus: "unavailable",
    },
    `Simulated scenario loaded: ${scenario.label} (${scenario.languageLabel}). No Gemini request was made.`,
    now,
  );
}