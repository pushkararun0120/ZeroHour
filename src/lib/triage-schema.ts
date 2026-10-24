import { Type, type Schema } from "@google/genai";

/**
 * ZeroHour model configuration.
 * Keep model IDs in one place. gemini-2.5-flash returned 404 ("no longer
 * available to new users") for our API key on 24 Oct 2026, so the primary
 * model was changed after a manual test. The fallbacks are tried in order
 * when the primary returns 503 or 404.
 */
export const ZEROHOUR_MODEL_ID = "gemini-3-flash-preview" as const;
export const ZEROHOUR_FALLBACK_MODEL_IDS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
] as const;

export type LanguageCode = "ta-IN" | "hi-IN" | "te-IN" | "ml-IN" | "en-IN";

export type TriagePriority =
  | "ESI_1_RESUSCITATION"
  | "ESI_2_EMERGENT"
  | "ESI_3_URGENT";

export type IncidentCategory =
  | "CARDIAC_EMERGENCY"
  | "ROAD_POLYTRAUMA"
  | "ELECTRICAL_CIVIC_HAZARD"
  | "STROKE_NEURO"
  | "RESPIRATORY_MEDICAL"
  | "OTHER_OR_UNCLEAR";

export type MedicationLegibility =
  | "CLEAR"
  | "PARTIALLY_LEGIBLE"
  | "UNREADABLE";

export interface MedicationObservation {
  medication_name: string;
  strength_text: string;
  dose_frequency_text: string;
  source_text: string;
  legibility_status: MedicationLegibility;
  requires_user_confirmation: boolean;
}

export interface FirstAidProtocol {
  spoken_instruction_en: string;
  spoken_instruction_native: string;
  multilingual_tts_map: {
    ta: string;
    hi: string;
    te: string;
    ml: string;
  };
  requires_cpr_metronome: boolean;
  step_by_step_actions: string[];
  safety_caveats: string[];
}

export interface BystanderCrowdControl {
  danger_banner_en: string;
  danger_banner_ta: string;
  danger_banner_hi: string;
  danger_banner_te: string;
  danger_banner_ml: string;
  crowd_delegation_task: string;
}

export interface MedicalHistoryOcr {
  chronic_conditions: string[];
  detected_medications: string[];
  allergies: string[];
  medication_observations: MedicationObservation[];
  critical_drug_trauma_alert: string;
  extraction_uncertainties: string[];
}

export interface SceneAssessment {
  scene_summary: string;
  reported_findings: string[];
  visual_observations: string[];
  hazard_flags: string[];
  unknowns: string[];
}

export interface AutoDriverRouting {
  recommended_hospital_id: string;
  recommended_hospital_name: string;
  required_capability_matched: string;
  routing_rationale: string;
  emergency_gate_instructions: string;
  spoken_driver_direction_native: string;
}

export interface CivicDispatchPayload {
  notify_108_ambulance: boolean;
  notify_power_utility_cutoff: boolean;
  notify_civic_command_hazard: boolean;
  dispatch_notes: string;
}

/**
 * This is a clinical summary used as input to the app's FHIR mapper.
 * It is NOT, by itself, a valid FHIR R4 Bundle.
 */
export interface FhirR4BundleSummary {
  resourceType: string;
  chiefComplaint: string;
  suspectedDiagnosis: string;
  activeMedications: string[];
  vitalRiskFlags: string[];
  receivingFacility: string;
}

export interface ZeroHourTriageResult {
  incident_id: string;
  detected_language_code: LanguageCode;
  detected_language_name: string;
  triage_priority: TriagePriority;
  triage_rationale: string;
  incident_category: IncidentCategory;
  extracted_caller_transcript: string;
  clinical_english_translation: string;
  visual_evidence_tags: string[];
  scene_assessment: SceneAssessment;
  first_aid_protocol: FirstAidProtocol;
  bystander_crowd_control: BystanderCrowdControl;
  medical_history_ocr: MedicalHistoryOcr;
  auto_driver_routing: AutoDriverRouting;
  civic_dispatch_payload: CivicDispatchPayload;
  fhir_r4_bundle_summary: FhirR4BundleSummary;
  assessment_limitations: string[];
}

/**
 * Application-owned provenance. Set this in application code based on the
 * actual execution path; never ask Gemini to decide whether a result was live
 * or synthetic.
 */
export type TriageDataSource = "live-gemini" | "synthetic-demo";

/**
 * Structured-output schema for @google/genai GenerateContentConfig.responseSchema.
 * Validate the parsed object in application code as well. A schema-conforming
 * response may still contain incorrect clinical interpretations or hospital data.
 */
export const ZeroHourTriageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    incident_id: {
      type: Type.STRING,
      description:
        "Echo the incident ID supplied by the application. The app must create and own stable incident IDs.",
    },
    detected_language_code: {
      type: Type.STRING,
      enum: ["ta-IN", "hi-IN", "te-IN", "ml-IN", "en-IN"],
      description:
        "Primary language of the caller, including code-mixed speech. Use en-IN when English is primary or the language cannot be determined reliably.",
    },
    detected_language_name: {
      type: Type.STRING,
      description:
        "Human-readable language name, optionally noting code-mixing, such as Tamil (Tanglish) or Hindi (Hinglish).",
    },
    triage_priority: {
      type: Type.STRING,
      enum: ["ESI_1_RESUSCITATION", "ESI_2_EMERGENT", "ESI_3_URGENT"],
      description:
        "Provisional prototype triage category. Do not represent this model-generated classification as a confirmed clinician-assigned ESI score.",
    },
    triage_rationale: {
      type: Type.STRING,
      description:
        "Concise, evidence-linked explanation for the provisional priority. Explicitly mention critical missing information; do not claim certainty that the inputs do not support.",
    },
    incident_category: {
      type: Type.STRING,
      enum: [
        "CARDIAC_EMERGENCY",
        "ROAD_POLYTRAUMA",
        "ELECTRICAL_CIVIC_HAZARD",
        "STROKE_NEURO",
        "RESPIRATORY_MEDICAL",
        "OTHER_OR_UNCLEAR",
      ],
      description: "Best-supported incident category, or OTHER_OR_UNCLEAR when evidence is insufficient.",
    },
    extracted_caller_transcript: {
      type: Type.STRING,
      description:
        "Transcript of caller speech. Preserve meaningful regional-language and code-mixed wording. Mark uncertainty rather than inventing inaudible words.",
    },
    clinical_english_translation: {
      type: Type.STRING,
      description:
        "Concise English rendering for review by emergency staff. Separate what the caller reported from what the model inferred.",
    },
    visual_evidence_tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Short scene, clinical-sign or hazard tags supported by supplied frames or images. Do not infer details from images that are absent or unclear.",
    },
    scene_assessment: {
      type: Type.OBJECT,
      properties: {
        scene_summary: {
          type: Type.STRING,
          description: "Brief scene summary based only on supplied input.",
        },
        reported_findings: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Symptoms or events explicitly reported by the caller.",
        },
        visual_observations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Visible findings from supplied images or frames; use cautious wording.",
        },
        hazard_flags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Immediate scene hazards supported by the provided input.",
        },
        unknowns: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Important missing or uncertain details that should not be guessed.",
        },
      },
      required: [
        "scene_summary",
        "reported_findings",
        "visual_observations",
        "hazard_flags",
        "unknowns",
      ],
    },
    first_aid_protocol: {
      type: Type.OBJECT,
      properties: {
        spoken_instruction_en: {
          type: Type.STRING,
          description:
            "Short, calm immediate guidance in English. Avoid unsupported diagnosis and avoid instructions that depend on uncertain facts.",
        },
        spoken_instruction_native: {
          type: Type.STRING,
          description:
            "Short, calm guidance in the detected primary language, using its appropriate script when practical.",
        },
        multilingual_tts_map: {
          type: Type.OBJECT,
          properties: {
            ta: { type: Type.STRING, description: "Tamil instructions in Tamil script." },
            hi: { type: Type.STRING, description: "Hindi instructions in Devanagari." },
            te: { type: Type.STRING, description: "Telugu instructions in Telugu script." },
            ml: { type: Type.STRING, description: "Malayalam instructions in Malayalam script." },
          },
          required: ["ta", "hi", "te", "ml"],
        },
        requires_cpr_metronome: {
          type: Type.BOOLEAN,
          description:
            "Whether the input appears to describe an unresponsive person who is not breathing normally and CPR guidance should be activated. Do not infer this solely from chest pain or dizziness.",
        },
        step_by_step_actions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "Short, ordered actions using established first-aid guidance. Do not instruct an untrained bystander to perform unsafe procedures.",
        },
        safety_caveats: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "Relevant cautions, including scene safety and actions to avoid. Keep these concise and practical.",
        },
      },
      required: [
        "spoken_instruction_en",
        "spoken_instruction_native",
        "multilingual_tts_map",
        "requires_cpr_metronome",
        "step_by_step_actions",
        "safety_caveats",
      ],
    },
    bystander_crowd_control: {
      type: Type.OBJECT,
      properties: {
        danger_banner_en: {
          type: Type.STRING,
          description: "Concise, high-contrast English warning appropriate to the described incident.",
        },
        danger_banner_ta: {
          type: Type.STRING,
          description: "Concise Tamil warning in Tamil script.",
        },
        danger_banner_hi: {
          type: Type.STRING,
          description: "Concise Hindi warning in Devanagari.",
        },
        danger_banner_te: {
          type: Type.STRING,
          description: "Concise Telugu warning in Telugu script.",
        },
        danger_banner_ml: {
          type: Type.STRING,
          description: "Concise Malayalam warning in Malayalam script.",
        },
        crowd_delegation_task: {
          type: Type.STRING,
          description:
            "A specific, safe task for a nearby bystander, such as clearing access or contacting emergency services. Do not claim that the task has been completed.",
        },
      },
      required: [
        "danger_banner_en",
        "danger_banner_ta",
        "danger_banner_hi",
        "danger_banner_te",
        "danger_banner_ml",
        "crowd_delegation_task",
      ],
    },
    medical_history_ocr: {
      type: Type.OBJECT,
      properties: {
        chronic_conditions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Conditions explicitly legible or supplied by the user. Note when information is uncertain.",
        },
        detected_medications: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Medication names that may be visible or provided in text. Uncertain entries must be clearly identified.",
        },
        allergies: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Allergies explicitly stated or legible in the supplied record. Do not assume an empty list means no allergies.",
        },
        medication_observations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              medication_name: { type: Type.STRING, description: "Best reading of the medication name." },
              strength_text: { type: Type.STRING, description: "Strength as written, or an empty string if unreadable or absent." },
              dose_frequency_text: { type: Type.STRING, description: "Dose/frequency exactly as legible, or an empty string if absent or uncertain." },
              source_text: { type: Type.STRING, description: "Short transcription of the relevant source text." },
              legibility_status: {
                type: Type.STRING,
                enum: ["CLEAR", "PARTIALLY_LEGIBLE", "UNREADABLE"],
                description: "Model-assessed text legibility, not a calibrated probability of correctness.",
              },
              requires_user_confirmation: {
                type: Type.BOOLEAN,
                description: "True when a person should review the extracted reading before it is relied upon.",
              },
            },
            required: [
              "medication_name",
              "strength_text",
              "dose_frequency_text",
              "source_text",
              "legibility_status",
              "requires_user_confirmation",
            ],
          },
          description: "Per-medication OCR observations that allow the UI to present uncertainty clearly.",
        },
        critical_drug_trauma_alert: {
          type: Type.STRING,
          description:
            "Potential medication-trauma concern requiring clinician review. Do not state a drug interaction as confirmed unless supported; empty string means no specific alert was identified from the supplied data, not that there is no risk.",
        },
        extraction_uncertainties: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Names, dosages, conditions or other details that could not be read or established reliably.",
        },
      },
      required: [
        "chronic_conditions",
        "detected_medications",
        "allergies",
        "medication_observations",
        "critical_drug_trauma_alert",
        "extraction_uncertainties",
      ],
    },
    auto_driver_routing: {
      type: Type.OBJECT,
      properties: {
        recommended_hospital_id: {
          type: Type.STRING,
          description:
            "ID of a hospital supplied in the current request's trusted directory. Use an empty string when no directory record can be safely matched. Never invent a new ID.",
        },
        recommended_hospital_name: {
          type: Type.STRING,
          description: "Name copied from the matched directory record, or an empty string if no safe match exists.",
        },
        required_capability_matched: {
          type: Type.STRING,
          description: "Relevant capability from the matched directory record, or an empty string when none is established.",
        },
        routing_rationale: {
          type: Type.STRING,
          description: "Brief explanation of which stated or suspected need motivated the match; do not claim the hospital has accepted the patient.",
        },
        emergency_gate_instructions: {
          type: Type.STRING,
          description: "Gate instructions copied from the supplied directory and clearly treated as unverified unless independently confirmed.",
        },
        spoken_driver_direction_native: {
          type: Type.STRING,
          description: "Short direction in the selected or detected regional language, plus English when useful. Do not claim live traffic routing unless a routing service supplies it.",
        },
      },
      required: [
        "recommended_hospital_id",
        "recommended_hospital_name",
        "required_capability_matched",
        "routing_rationale",
        "emergency_gate_instructions",
        "spoken_driver_direction_native",
      ],
    },
    civic_dispatch_payload: {
      type: Type.OBJECT,
      properties: {
        notify_108_ambulance: {
          type: Type.BOOLEAN,
          description: "Recommendation to contact emergency ambulance services; this does not mean a call was placed.",
        },
        notify_power_utility_cutoff: {
          type: Type.BOOLEAN,
          description: "Recommendation to request power isolation where a dangerous electrical hazard is reported; this does not mean power was cut off.",
        },
        notify_civic_command_hazard: {
          type: Type.BOOLEAN,
          description: "Recommendation to notify an appropriate civic hazard service; this does not mean a notification was sent.",
        },
        dispatch_notes: {
          type: Type.STRING,
          description: "Concise suggested dispatch notes. The application must show integration status separately from these model recommendations.",
        },
      },
      required: [
        "notify_108_ambulance",
        "notify_power_utility_cutoff",
        "notify_civic_command_hazard",
        "dispatch_notes",
      ],
    },
    fhir_r4_bundle_summary: {
      type: Type.OBJECT,
      properties: {
        resourceType: {
          type: Type.STRING,
          description:
            "Legacy summary field retained for compatibility. This object is not itself a FHIR R4 Bundle. The application must create and validate the actual Bundle separately.",
        },
        chiefComplaint: { type: Type.STRING, description: "Concise chief complaint summary." },
        suspectedDiagnosis: { type: Type.STRING, description: "Suspected condition for review, not a confirmed diagnosis." },
        activeMedications: { type: Type.ARRAY, items: { type: Type.STRING } },
        vitalRiskFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
        receivingFacility: {
          type: Type.STRING,
          description: "Recommended facility name only; this does not indicate acceptance or confirmed notification.",
        },
      },
      required: [
        "resourceType",
        "chiefComplaint",
        "suspectedDiagnosis",
        "activeMedications",
        "vitalRiskFlags",
        "receivingFacility",
      ],
    },
    assessment_limitations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Important limitations, missing inputs or uncertainties that the user and receiving clinician should know. Do not use this list to hide critical hazards.",
    },
  },
  required: [
    "incident_id",
    "detected_language_code",
    "detected_language_name",
    "triage_priority",
    "triage_rationale",
    "incident_category",
    "extracted_caller_transcript",
    "clinical_english_translation",
    "visual_evidence_tags",
    "scene_assessment",
    "first_aid_protocol",
    "bystander_crowd_control",
    "medical_history_ocr",
    "auto_driver_routing",
    "civic_dispatch_payload",
    "fhir_r4_bundle_summary",
    "assessment_limitations",
  ],
};
