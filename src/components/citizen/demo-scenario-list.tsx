"use client";

import { useSession } from "@/components/session-provider";
import { DEMO_SCENARIOS, SIMULATED_LABEL, type DemoScenario } from "@/lib/demo-scenarios";
import { startDemoIncident } from "@/lib/demo-incident";

interface DemoScenarioListProps {
  /** Called after the incident is created, so the page can open First Aid. */
  onStarted: () => void;
}

export function DemoScenarioList({ onStarted }: DemoScenarioListProps) {
  const { upsertIncident } = useSession();

  function start(scenario: DemoScenario) {
    upsertIncident(startDemoIncident(scenario));
    onStarted();
  }

  return (
    <section aria-labelledby="demo-heading" className="mt-8">
      <h3 id="demo-heading" className="text-xl font-semibold md:text-2xl">
        Simulated demo scenarios
      </h3>
      <p className="mt-1 text-muted">
        These are written examples. No camera, microphone or Gemini request is used.
      </p>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {DEMO_SCENARIOS.map((scenario) => (
          <li key={scenario.id}>
            <button
              type="button"
              onClick={() => start(scenario)}
              className="panel flex h-full w-full flex-col items-start gap-1 text-left hover:border-primary hover:bg-primary-soft"
            >
              <span className="text-xl font-semibold">{scenario.label}</span>
              <span className="text-muted">{scenario.languageLabel}</span>
              <span className="mt-1">{scenario.summary}</span>
              <span className="badge badge-sim mt-3">{SIMULATED_LABEL}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}