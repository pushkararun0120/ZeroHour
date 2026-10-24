import type { Coordinates } from "./hospitals";
import type { TriageDataSource, TriagePriority, ZeroHourTriageResult } from "./triage-schema";

export type IncidentStatus = "capturing" | "processing" | "active" | "completed" | "error";

export type LocationStatus = "pending" | "granted" | "denied" | "unavailable";

export interface IncidentEvent {
  /** ISO timestamp. */
  at: string;
  message: string;
}

/** A person's review of one OCR medication reading. Kept outside the model output. */
export interface OcrReview {
  confirmed: boolean;
  correctedText?: string;
}

/** The app-owned record that wraps the model's triage result. */
export interface Incident {
  incident_id: string;
  /** ISO timestamp. Also the start point of the Golden Hour timer. */
  created_at: string;
  updated_at: string;
  status: IncidentStatus;
  /** Set by app code from the real execution path, never by the model. */
  source: TriageDataSource;
  triage: ZeroHourTriageResult | null;
  /** The device's real coordinates only. Never filled with a fallback location. */
  location: Coordinates | null;
  locationStatus: LocationStatus;
  /** Keyed by index in triage.medical_history_ocr.medication_observations. */
  ocrReview: Record<number, OcrReview>;
  events: IncidentEvent[];
  error: string | null;
}

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Readable ID such as ZH-20261024-114533-A7K2. */
export function createIncidentId(
  now: Date = new Date(),
  random: () => number = Math.random,
): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15).replace("T", "-");
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += ID_ALPHABET[Math.floor(random() * ID_ALPHABET.length)];
  }
  return `ZH-${stamp}-${suffix}`;
}

interface CreateIncidentOptions {
  source: TriageDataSource;
  id?: string;
  now?: Date;
}

export function createIncident({
  source,
  id,
  now = new Date(),
}: CreateIncidentOptions): Incident {
  const at = now.toISOString();
  return {
    incident_id: id ?? createIncidentId(now),
    created_at: at,
    updated_at: at,
    status: "capturing",
    source,
    triage: null,
    location: null,
    locationStatus: "pending",
    ocrReview: {},
    events: [{ at, message: "Incident created" }],
    error: null,
  };
}

type IncidentChanges = Partial<
  Omit<Incident, "incident_id" | "created_at" | "updated_at" | "events">
>;

/**
 * Returns an updated copy of the incident. The ID and creation time never
 * change, so a prescription scan updates the same incident instead of
 * creating a second one.
 */
export function patchIncident(
  incident: Incident,
  changes: IncidentChanges,
  eventMessage?: string,
  now: Date = new Date(),
): Incident {
  const at = now.toISOString();
  return {
    ...incident,
    ...changes,
    updated_at: at,
    events: eventMessage
      ? [...incident.events, { at, message: eventMessage }]
      : incident.events,
  };
}

const PRIORITY_RANK: Record<TriagePriority, number> = {
  ESI_1_RESUSCITATION: 0,
  ESI_2_EMERGENT: 1,
  ESI_3_URGENT: 2,
};

/** Incidents with no triage result yet go last. */
const NO_TRIAGE_RANK = 3;

function rankOf(incident: Incident): number {
  return incident.triage ? PRIORITY_RANK[incident.triage.triage_priority] : NO_TRIAGE_RANK;
}

/** ER queue order: highest priority first, then most recently updated. */
export function sortQueue(incidents: readonly Incident[]): Incident[] {
  return [...incidents].sort((a, b) => {
    const byPriority = rankOf(a) - rankOf(b);
    if (byPriority !== 0) return byPriority;
    return Date.parse(b.updated_at) - Date.parse(a.updated_at);
  });
}

/** Whole seconds since the incident started, never negative. */
export function elapsedSeconds(startIso: string, nowMs: number): number {
  const start = Date.parse(startIso);
  if (Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((nowMs - start) / 1000));
}

/** Formats seconds as "T+ 00:00:00" for the Golden Hour timer. */
export function formatElapsed(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `T+ ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}