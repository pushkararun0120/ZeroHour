"use client";

import { ArrowRight } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { getAutoPilotStep, type TabId } from "@/lib/navigation";

interface AutoPilotBarProps {
  current: TabId;
  onNavigate: (tab: TabId) => void;
}

/** One-tap guide to the next step. It only opens a tab and never marks a step as done. */
export function AutoPilotBar({ current, onNavigate }: AutoPilotBarProps) {
  const { activeIncident } = useSession();
  const step = getAutoPilotStep(current, activeIncident);
  const { target } = step;

  return (
    <section
      aria-label="Panic Auto-Pilot"
      className="border-b border-line bg-paper px-2 py-2 md:rounded-md md:border md:p-3"
    >
      <p className="px-1 text-sm font-semibold text-muted">Panic Auto-Pilot</p>
      {target ? (
        <button
          type="button"
          onClick={() => onNavigate(target)}
          className="btn btn-primary mt-1 w-full justify-between gap-3 text-left"
        >
          <span className="block">
            <span className="block">{step.title}</span>
            <span className="block text-sm font-normal">{step.detail}</span>
          </span>
          <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
        </button>
      ) : (
        <div className="mt-1 px-1">
          <p className="font-semibold">{step.title}</p>
          <p className="text-sm text-muted">{step.detail}</p>
        </div>
      )}
    </section>
  );
}