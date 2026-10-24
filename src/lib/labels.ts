import type { IncidentStatus } from "./incident";
import type { IncidentCategory, TriageDataSource, TriagePriority } from "./triage-schema";

export type PriorityTone = "critical" | "emergent" | "urgent" | "pending";

const PRIORITY_SHORT: Record<TriagePriority, string> = {
  ESI_1_RESUSCITATION: "ESI 1",
  ESI_2_EMERGENT: "ESI 2",
  ESI_3_URGENT: "ESI 3",
};

const PRIORITY_NAME: Record<TriagePriority, string> = {
  ESI_1_RESUSCITATION: "Resuscitation",
  ESI_2_EMERGENT: "Emergent",
  ESI_3_URGENT: "Urgent",
};

const PRIORITY_TONE: Record<TriagePriority, PriorityTone> = {
  ESI_1_RESUSCITATION: "critical",
  ESI_2_EMERGENT: "emergent",
  ESI_3_URGENT: "urgent",
};

const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  CARDIAC_EMERGENCY: "Cardiac emergency",
  ROAD_POLYTRAUMA: "Road polytrauma",
  ELECTRICAL_CIVIC_HAZARD: "Electrical and civic hazard",
  STROKE_NEURO: "Stroke or neurological",
  RESPIRATORY_MEDICAL: "Respiratory or medical",
  OTHER_OR_UNCLEAR: "Other or unclear",
};

const SOURCE_LABELS: Record<TriageDataSource, string> = {
  "live-gemini": "Live (Gemini)",
  "synthetic-demo": "Simulated Demo",
};

const STATUS_LABELS: Record<IncidentStatus, string> = {
  capturing: "Capturing",
  processing: "Processing",
  active: "Active",
  completed: "Completed",
  error: "Error",
};

export function priorityShort(priority: TriagePriority): string {
  return PRIORITY_SHORT[priority];
}

/** For example "ESI 1: Resuscitation". This is a provisional model label, not a clinician score. */
export function priorityLabel(priority: TriagePriority): string {
  return `${PRIORITY_SHORT[priority]}: ${PRIORITY_NAME[priority]}`;
}

/** Colour meaning is fixed: critical is crimson, emergent is amber, urgent is navy. */
export function priorityTone(priority: TriagePriority | null | undefined): PriorityTone {
  return priority ? PRIORITY_TONE[priority] : "pending";
}

export function categoryLabel(category: IncidentCategory): string {
  return CATEGORY_LABELS[category];
}

export function sourceLabel(source: TriageDataSource): string {
  return SOURCE_LABELS[source];
}

export function statusLabel(status: IncidentStatus): string {
  return STATUS_LABELS[status];
}