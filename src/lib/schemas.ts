import { z } from "zod";
import type { Incident } from "./incident";
import type { ZeroHourTriageResult } from "./triage-schema";

const MAX_TEXT = 4000;

const text = (max: number = MAX_TEXT) => z.string().max(max);
const textList = (maxItems = 40) => z.array(text(1000)).max(maxItems);

const isoTimestamp = z
  .string()
  .max(40)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Not a valid date");

const languageCode = z.enum(["ta-IN", "hi-IN", "te-IN", "ml-IN", "en-IN"]);
const triagePriority = z.enum(["ESI_1_RESUSCITATION", "ESI_2_EMERGENT", "ESI_3_URGENT"]);
const incidentCategory = z.enum([
  "CARDIAC_EMERGENCY",
  "ROAD_POLYTRAUMA",
  "ELECTRICAL_CIVIC_HAZARD",
  "STROKE_NEURO",
  "RESPIRATORY_MEDICAL",
  "OTHER_OR_UNCLEAR",
]);
const legibility = z.enum(["CLEAR", "PARTIALLY_LEGIBLE", "UNREADABLE"]);

const medicationObservationSchema = z.object({
  medication_name: text(200),
  strength_text: text(200),
  dose_frequency_text: text(200),
  source_text: text(500),
  legibility_status: legibility,
  requires_user_confirmation: z.boolean(),
});

/** Checks a triage result, whether it came from Gemini, a fixture or another tab. */
export const triageResultSchema: z.ZodType<ZeroHourTriageResult> = z.object({
  incident_id: z.string().min(1).max(100),
  detected_language_code: languageCode,
  detected_language_name: text(100),
  triage_priority: triagePriority,
  triage_rationale: text(),
  incident_category: incidentCategory,
  extracted_caller_transcript: text(),
  clinical_english_translation: text(),
  visual_evidence_tags: textList(),
  scene_assessment: z.object({
    scene_summary: text(),
    reported_findings: textList(),
    visual_observations: textList(),
    hazard_flags: textList(),
    unknowns: textList(),
  }),
  first_aid_protocol: z.object({
    spoken_instruction_en: text(),
    spoken_instruction_native: text(),
    multilingual_tts_map: z.object({
      ta: text(),
      hi: text(),
      te: text(),
      ml: text(),
    }),
    requires_cpr_metronome: z.boolean(),
    step_by_step_actions: textList(),
    safety_caveats: textList(),
  }),
  bystander_crowd_control: z.object({
    danger_banner_en: text(500),
    danger_banner_ta: text(500),
    danger_banner_hi: text(500),
    danger_banner_te: text(500),
    danger_banner_ml: text(500),
    crowd_delegation_task: text(500),
  }),
  medical_history_ocr: z.object({
    chronic_conditions: textList(),
    detected_medications: textList(),
    allergies: textList(),
    medication_observations: z.array(medicationObservationSchema).max(60),
    critical_drug_trauma_alert: text(),
    extraction_uncertainties: textList(),
  }),
  auto_driver_routing: z.object({
    recommended_hospital_id: text(100),
    recommended_hospital_name: text(200),
    required_capability_matched: text(100),
    routing_rationale: text(),
    emergency_gate_instructions: text(500),
    spoken_driver_direction_native: text(1000),
  }),
  civic_dispatch_payload: z.object({
    notify_108_ambulance: z.boolean(),
    notify_power_utility_cutoff: z.boolean(),
    notify_civic_command_hazard: z.boolean(),
    dispatch_notes: text(),
  }),
  fhir_r4_bundle_summary: z.object({
    resourceType: text(100),
    chiefComplaint: text(500),
    suspectedDiagnosis: text(500),
    activeMedications: textList(),
    vitalRiskFlags: textList(),
    receivingFacility: text(200),
  }),
  assessment_limitations: textList(),
});

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const ocrReviewSchema = z.object({
  confirmed: z.boolean(),
  correctedText: text(500).optional(),
});

/** Checks an app-owned incident record. */
export const incidentSchema: z.ZodType<Incident> = z.object({
  incident_id: z.string().min(1).max(100),
  created_at: isoTimestamp,
  updated_at: isoTimestamp,
  status: z.enum(["capturing", "processing", "active", "completed", "error"]),
  source: z.enum(["live-gemini", "synthetic-demo"]),
  triage: triageResultSchema.nullable(),
  location: coordinatesSchema.nullable(),
  locationStatus: z.enum(["pending", "granted", "denied", "unavailable"]),
  ocrReview: z.record(z.string(), ocrReviewSchema),
  events: z.array(z.object({ at: isoTimestamp, message: text(500) })).max(200),
  error: text(500).nullable(),
});