import type { Incident } from "./incident";
import { countUnconfirmed } from "./ocr";

export type TabId = "capture" | "first-aid" | "crowd-shield" | "med-scan" | "er-handoff";

export interface TabInfo {
  id: TabId;
  number: string;
  label: string;
}

export const TABS: readonly TabInfo[] = [
  { id: "capture", number: "01", label: "Capture" },
  { id: "first-aid", number: "02", label: "First Aid" },
  { id: "crowd-shield", number: "03", label: "Crowd Shield" },
  { id: "med-scan", number: "04", label: "Med Scan" },
  { id: "er-handoff", number: "05", label: "ER Handoff" },
];

export const TAB_BY_ID = Object.fromEntries(TABS.map((tab) => [tab.id, tab])) as Record<
  TabId,
  TabInfo
>;

export interface AutoPilotStep {
  /** The tab a tap should open, or null when there is nothing to open yet. */
  target: TabId | null;
  title: string;
  detail: string;
}

/** Where "Return to Emergency" goes: First Aid once there is guidance, otherwise Capture. */
export function emergencyTab(incident: Incident | null): TabId {
  return incident?.triage ? "first-aid" : "capture";
}

function detailFor(tab: TabId, incident: Incident): string {
  switch (tab) {
    case "capture":
      return "Start a new emergency.";
    case "first-aid":
      return "Speak the guidance and follow the steps.";
    case "crowd-shield":
      return "Show the warning to people nearby.";
    case "med-scan": {
      const count = countUnconfirmed(incident);
      if (count === 0) return "Optional. Scan a prescription or tablet strip.";
      return `${count} medicine ${count === 1 ? "reading needs" : "readings need"} review.`;
    }
    case "er-handoff":
      return "Hospital match, directions and handoff card.";
  }
}

/**
 * Suggests the next tab. It only follows the incident's state and the tab
 * order. Opening a tab never marks anything as done, and every step can be
 * skipped by using the navigation directly.
 */
export function getAutoPilotStep(current: TabId, incident: Incident | null): AutoPilotStep {
  if (!incident) {
    return current === "capture"
      ? {
          target: null,
          title: "Start an emergency",
          detail: "Start an emergency or pick a simulated scenario.",
        }
      : { target: "capture", title: "Go to 01 Capture", detail: "There is no active incident yet." };
  }

  if (incident.status === "error") {
    return {
      target: "capture",
      title: "Back to 01 Capture",
      detail: incident.error ?? "Something went wrong. Try again.",
    };
  }

  if (!incident.triage) {
    return { target: null, title: "Processing", detail: "Waiting for the triage result." };
  }

  if (current === "er-handoff") {
    return {
      target: "first-aid",
      title: "Back to 02 First Aid",
      detail: "This is the last step. First aid stays available.",
    };
  }

  const next = TABS[TABS.findIndex((tab) => tab.id === current) + 1];
  return {
    target: next.id,
    title: `Next: ${next.number} ${next.label}`,
    detail: detailFor(next.id, incident),
  };
}