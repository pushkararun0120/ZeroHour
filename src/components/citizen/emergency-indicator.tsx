"use client";

import { useSession } from "@/components/session-provider";
import {
  categoryLabel,
  priorityLabel,
  priorityTone,
  sourceLabel,
  statusLabel,
  type PriorityTone,
} from "@/lib/labels";
import { emergencyTab, type TabId } from "@/lib/navigation";

const TONE_ACCENT: Record<PriorityTone, string> = {
  critical: "border-l-crimson",
  emergent: "border-l-amber",
  urgent: "border-l-navy",
  pending: "border-l-line",
};

interface EmergencyIndicatorProps {
  onReturn: (tab: TabId) => void;
}

/** Always-visible incident status with a Return to Emergency button. */
export function EmergencyIndicator({ onReturn }: EmergencyIndicatorProps) {
  const { activeIncident: incident } = useSession();
  const tone = priorityTone(incident?.triage?.triage_priority);

  return (
    <section
      aria-label="Active incident"
      className="sticky top-0 z-30 border-b border-line bg-surface pt-[env(safe-area-inset-top)]"
    >
      <div className={`border-l-8 px-4 py-2 md:px-4 ${TONE_ACCENT[tone]}`}>
        {incident ? (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <p className="font-semibold">
                Active emergency{" "}
                <span className="font-mono text-sm font-normal">{incident.incident_id}</span>
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold">
                  {incident.triage
                    ? priorityLabel(incident.triage.triage_priority)
                    : "Awaiting triage"}
                </span>
                {incident.triage ? <span>{categoryLabel(incident.triage.incident_category)}</span> : null}
                <span
                  className={`badge ${incident.source === "synthetic-demo" ? "badge-sim" : "badge-live"}`}
                >
                  {sourceLabel(incident.source)}
                </span>
                <span className="badge badge-neutral">{statusLabel(incident.status)}</span>
              </p>
            </div>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onReturn(emergencyTab(incident))}
            >
              Return to Emergency
            </button>
          </div>
        ) : (
          <p className="py-1.5 text-muted">No active incident</p>
        )}
      </div>
    </section>
  );
}