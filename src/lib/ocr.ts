import { patchIncident, type Incident, type OcrReview } from "./incident";
import type {
  MedicalHistoryOcr,
  MedicationObservation,
  ZeroHourTriageResult,
} from "./triage-schema";

const OCR_LIMITATION =
  "Medication readings come from a scanned record and need review by a person before anyone relies on them.";
const OCR_ALERT_FLAG = "Medication alert from a scanned record (needs clinician review)";

/** Where a scan result came from. Shown in the incident's event log. */
export type OcrOrigin = { kind: "sample"; label: string } | { kind: "gemini" };

export type OcrReadingStatus = "extracted" | "needs-review" | "confirmed" | "corrected";

function normaliseKey(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Joins two lists, dropping empty items and repeats (ignoring case and extra spaces). */
export function unionStrings(existing: readonly string[], incoming: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of [...existing, ...incoming]) {
    const key = normaliseKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item.trim());
  }
  return result;
}

function observationKey(observation: MedicationObservation): string {
  return [
    observation.medication_name,
    observation.strength_text,
    observation.dose_frequency_text,
    observation.source_text,
  ]
    .map(normaliseKey)
    .join("|");
}

function mergeAlerts(existing: string, incoming: string): string {
  const parts = [existing, incoming].map((part) => part.trim()).filter(Boolean);
  if (parts.length === 2 && normaliseKey(parts[0]) === normaliseKey(parts[1])) {
    return parts[0];
  }
  return parts.join("\n");
}

function isReadable(observation: MedicationObservation): boolean {
  return observation.legibility_status !== "UNREADABLE" && observation.medication_name.trim() !== "";
}

function summaryLabel(observation: MedicationObservation): string {
  const name = `${observation.medication_name} ${observation.strength_text}`.trim();
  return `${name} (from scanned record)`;
}

/**
 * Adds a scan's results to an existing triage result. Nothing already known is
 * removed, repeated readings are skipped, and new readings are only appended,
 * so the positions used by the user's review marks stay valid.
 */
export function mergeOcrIntoTriage(
  triage: ZeroHourTriageResult,
  ocr: MedicalHistoryOcr,
): ZeroHourTriageResult {
  const current = triage.medical_history_ocr;

  const known = new Set(current.medication_observations.map(observationKey));
  const added: MedicationObservation[] = [];
  for (const observation of ocr.medication_observations) {
    const key = observationKey(observation);
    if (known.has(key)) continue;
    known.add(key);
    added.push({ ...observation });
  }

  const medical_history_ocr: MedicalHistoryOcr = {
    chronic_conditions: unionStrings(current.chronic_conditions, ocr.chronic_conditions),
    detected_medications: unionStrings(current.detected_medications, ocr.detected_medications),
    allergies: unionStrings(current.allergies, ocr.allergies),
    medication_observations: [...current.medication_observations, ...added],
    critical_drug_trauma_alert: mergeAlerts(
      current.critical_drug_trauma_alert,
      ocr.critical_drug_trauma_alert,
    ),
    extraction_uncertainties: unionStrings(
      current.extraction_uncertainties,
      ocr.extraction_uncertainties,
    ),
  };

  const summary = triage.fhir_r4_bundle_summary;
  const newAlertFlag = ocr.critical_drug_trauma_alert.trim() ? [OCR_ALERT_FLAG] : [];

  return {
    ...triage,
    medical_history_ocr,
    fhir_r4_bundle_summary: {
      ...summary,
      activeMedications: unionStrings(
        summary.activeMedications,
        added.filter(isReadable).map(summaryLabel),
      ),
      vitalRiskFlags: unionStrings(summary.vitalRiskFlags, newAlertFlag),
    },
    assessment_limitations: unionStrings(triage.assessment_limitations, [OCR_LIMITATION]),
  };
}

/**
 * Applies a scan to an existing incident. The incident ID and creation time do
 * not change, so no second patient is created. Returns null when the incident
 * has no triage result yet, because there is nothing to merge into.
 */
export function applyOcrToIncident(
  incident: Incident,
  ocr: MedicalHistoryOcr,
  origin: OcrOrigin,
  now: Date = new Date(),
): Incident | null {
  if (!incident.triage) return null;

  const triage = mergeOcrIntoTriage(incident.triage, ocr);
  const added =
    triage.medical_history_ocr.medication_observations.length -
    incident.triage.medical_history_ocr.medication_observations.length;

  const message =
    origin.kind === "sample"
      ? `Simulated sample record added: ${origin.label} (${added} new readings)`
      : `Scanned record processed by Gemini (${added} new readings)`;

  return patchIncident(incident, { triage }, message, now);
}

/**
 * Records a person's review of one reading. A correction counts as confirmed.
 * An index that does not exist leaves the incident unchanged.
 */
export function reviewOcrReading(
  incident: Incident,
  index: number,
  review: OcrReview,
  now: Date = new Date(),
): Incident {
  const count = incident.triage?.medical_history_ocr.medication_observations.length ?? 0;
  if (!Number.isInteger(index) || index < 0 || index >= count) return incident;

  const correctedText = review.correctedText?.trim();
  const next: OcrReview = correctedText
    ? { confirmed: true, correctedText }
    : { confirmed: review.confirmed };

  const message = correctedText
    ? `OCR reading ${index + 1} corrected by user`
    : review.confirmed
      ? `OCR reading ${index + 1} confirmed by user`
      : `OCR reading ${index + 1} marked as not confirmed`;

  return patchIncident(
    incident,
    { ocrReview: { ...incident.ocrReview, [index]: next } },
    message,
    now,
  );
}

/** Separates what the model extracted from what a person confirmed or corrected. */
export function ocrStatus(
  observation: MedicationObservation,
  review: OcrReview | undefined,
): OcrReadingStatus {
  if (review?.correctedText) return "corrected";
  if (review?.confirmed) return "confirmed";
  return observation.requires_user_confirmation ? "needs-review" : "extracted";
}

/** Readings that still need a person to confirm or correct them. */
export function countUnconfirmed(incident: Incident): number {
  const observations = incident.triage?.medical_history_ocr.medication_observations ?? [];
  return observations.filter(
    (observation, index) =>
      observation.requires_user_confirmation && !incident.ocrReview[index]?.confirmed,
  ).length;
}