import { describe, expect, it } from "vitest";
import { buildDemoTriage, getDemoScenario, getSamplePrescription } from "./demo-scenarios";
import { createIncident, patchIncident } from "./incident";
import {
  applyOcrToIncident,
  countUnconfirmed,
  mergeOcrIntoTriage,
  ocrStatus,
  reviewOcrReading,
  unionStrings,
} from "./ocr";

const NOW = new Date("2026-10-24T11:05:00Z");

function activeIncident(scenarioId: string) {
  const scenario = getDemoScenario(scenarioId)!;
  const base = createIncident({
    source: "synthetic-demo",
    id: "ZH-TEST",
    now: new Date("2026-10-24T11:00:00Z"),
  });
  return patchIncident(base, { triage: buildDemoTriage(scenario, "ZH-TEST"), status: "active" });
}

const cardiacSample = () => getSamplePrescription("sample-cardiac-antiplatelet")!.ocr;
const headStrip = () => getSamplePrescription("sample-head-injury-strip")!.ocr;
const handwritten = () => getSamplePrescription("sample-handwritten-partial")!.ocr;

describe("unionStrings", () => {
  it("drops empty items and repeats, ignoring case and extra spaces", () => {
    expect(
      unionStrings(["Diabetes", " hypertension "], ["diabetes", "  Hypertension", "", "Asthma"]),
    ).toEqual(["Diabetes", "hypertension", "Asthma"]);
  });
});

describe("mergeOcrIntoTriage", () => {
  it("adds the scanned readings and keeps what the caller already reported", () => {
    const triage = activeIncident("tamil-cardiac").triage!;
    const merged = mergeOcrIntoTriage(triage, cardiacSample());

    expect(merged.medical_history_ocr.medication_observations).toHaveLength(2);
    expect(merged.medical_history_ocr.chronic_conditions).toContain(
      "Diabetes (reported by caller, not verified)",
    );
    expect(merged.medical_history_ocr.chronic_conditions).toContain(
      "Diabetes (written as K/C/O DM on the sheet)",
    );
    expect(merged.medical_history_ocr.critical_drug_trauma_alert).toMatch(/clopidogrel/i);
    expect(merged.fhir_r4_bundle_summary.activeMedications).toContain(
      "Blood thinner tablets (reported by caller, name not known)",
    );
    expect(merged.fhir_r4_bundle_summary.activeMedications).toContain(
      "Clopilet 75 mg (from scanned record)",
    );
    expect(merged.fhir_r4_bundle_summary.activeMedications).toContain(
      "Glycomet (from scanned record)",
    );
  });

  it("does not change the triage result that was passed in", () => {
    const triage = activeIncident("tamil-cardiac").triage!;
    mergeOcrIntoTriage(triage, cardiacSample());
    expect(triage.medical_history_ocr.medication_observations).toHaveLength(0);
  });

  it("keeps unreadable lines out of the summary medication list", () => {
    const triage = activeIncident("malayalam-stroke").triage!;
    const merged = mergeOcrIntoTriage(triage, handwritten());
    const meds = merged.fhir_r4_bundle_summary.activeMedications;

    expect(merged.medical_history_ocr.medication_observations).toHaveLength(3);
    expect(meds).toContain("Atorvastatin 20 mg (from scanned record)");
    expect(meds.some((m) => m.includes("Unreadable"))).toBe(false);
  });

  it("combines alerts from two scans and does not repeat the same alert", () => {
    const triage = activeIncident("tamil-cardiac").triage!;
    const once = mergeOcrIntoTriage(triage, cardiacSample());
    const twice = mergeOcrIntoTriage(once, headStrip());

    expect(twice.medical_history_ocr.critical_drug_trauma_alert).toMatch(/clopidogrel/i);
    expect(twice.medical_history_ocr.critical_drug_trauma_alert).toMatch(/aspirin/i);

    const again = mergeOcrIntoTriage(once, cardiacSample());
    expect(again.medical_history_ocr.critical_drug_trauma_alert).toBe(
      once.medical_history_ocr.critical_drug_trauma_alert,
    );
  });

  it("adds a limitation note and an alert flag", () => {
    const triage = activeIncident("hindi-polytrauma").triage!;
    const merged = mergeOcrIntoTriage(triage, headStrip());
    expect(merged.assessment_limitations.join(" ")).toMatch(/scanned record/i);
    expect(merged.fhir_r4_bundle_summary.vitalRiskFlags.join(" ")).toMatch(/medication alert/i);
  });
});

describe("applyOcrToIncident", () => {
  it("returns null when there is no triage result to merge into", () => {
    const empty = createIncident({ source: "synthetic-demo", id: "ZH-EMPTY" });
    expect(applyOcrToIncident(empty, cardiacSample(), { kind: "gemini" })).toBeNull();
  });

  it("updates the same incident instead of creating a new one", () => {
    const incident = activeIncident("tamil-cardiac");
    const updated = applyOcrToIncident(
      incident,
      cardiacSample(),
      { kind: "sample", label: "Clopilet and Glycomet" },
      NOW,
    )!;

    expect(updated.incident_id).toBe("ZH-TEST");
    expect(updated.created_at).toBe(incident.created_at);
    expect(updated.updated_at).toBe(NOW.toISOString());
    expect(updated.events.at(-1)?.message).toBe(
      "Simulated sample record added: Clopilet and Glycomet (2 new readings)",
    );
  });

  it("does not add the same readings twice", () => {
    const origin = { kind: "sample", label: "Clopilet and Glycomet" } as const;
    const first = applyOcrToIncident(activeIncident("tamil-cardiac"), cardiacSample(), origin)!;
    const second = applyOcrToIncident(first, cardiacSample(), origin)!;

    expect(second.triage!.medical_history_ocr.medication_observations).toHaveLength(2);
    expect(second.events.at(-1)?.message).toContain("(0 new readings)");
  });

  it("describes a Gemini scan differently from a sample", () => {
    const updated = applyOcrToIncident(
      activeIncident("hindi-polytrauma"),
      headStrip(),
      { kind: "gemini" },
    )!;
    expect(updated.events.at(-1)?.message).toBe("Scanned record processed by Gemini (1 new readings)");
  });
});

describe("reviewOcrReading", () => {
  const scanned = () =>
    applyOcrToIncident(activeIncident("tamil-cardiac"), cardiacSample(), { kind: "gemini" })!;

  it("records a confirmation and lowers the unconfirmed count", () => {
    const incident = scanned();
    expect(countUnconfirmed(incident)).toBe(1);

    const reviewed = reviewOcrReading(incident, 1, { confirmed: true }, NOW);
    expect(reviewed.ocrReview[1]).toEqual({ confirmed: true });
    expect(countUnconfirmed(reviewed)).toBe(0);
    expect(reviewed.events.at(-1)?.message).toBe("OCR reading 2 confirmed by user");
  });

  it("stores a trimmed correction and treats it as confirmed", () => {
    const reviewed = reviewOcrReading(
      scanned(),
      1,
      { confirmed: false, correctedText: "  Glycomet 500 mg  " },
      NOW,
    );
    expect(reviewed.ocrReview[1]).toEqual({ confirmed: true, correctedText: "Glycomet 500 mg" });
    expect(reviewed.events.at(-1)?.message).toBe("OCR reading 2 corrected by user");
  });

  it("can mark a reading as not confirmed", () => {
    const confirmed = reviewOcrReading(scanned(), 1, { confirmed: true }, NOW);
    const undone = reviewOcrReading(confirmed, 1, { confirmed: false }, NOW);
    expect(countUnconfirmed(undone)).toBe(1);
  });

  it("ignores an index that does not exist", () => {
    const incident = scanned();
    expect(reviewOcrReading(incident, 9, { confirmed: true })).toBe(incident);
    expect(reviewOcrReading(incident, -1, { confirmed: true })).toBe(incident);
  });
});

describe("ocrStatus", () => {
  const clear = getSamplePrescription("sample-cardiac-antiplatelet")!.ocr
    .medication_observations[0];
  const unclear = getSamplePrescription("sample-cardiac-antiplatelet")!.ocr
    .medication_observations[1];

  it("separates model readings from user review", () => {
    expect(ocrStatus(clear, undefined)).toBe("extracted");
    expect(ocrStatus(unclear, undefined)).toBe("needs-review");
    expect(ocrStatus(unclear, { confirmed: true })).toBe("confirmed");
    expect(ocrStatus(unclear, { confirmed: true, correctedText: "Glycomet 500 mg" })).toBe(
      "corrected",
    );
  });
});