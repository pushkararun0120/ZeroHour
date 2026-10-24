import { describe, expect, it } from "vitest";
import {
  DEMO_SCENARIOS,
  SAMPLE_PRESCRIPTIONS,
  buildDemoTriage,
  getDemoScenario,
  getSamplePrescription,
} from "./demo-scenarios";
import { getHospitalById } from "./hospitals";
import { getLanguage } from "./languages";

const SCRIPT = {
  ta: /[\u0B80-\u0BFF]/,
  hi: /[\u0900-\u097F]/,
  te: /[\u0C00-\u0C7F]/,
  ml: /[\u0D00-\u0D7F]/,
} as const;

type RegionalKey = keyof typeof SCRIPT;
const REGIONAL_KEYS = Object.keys(SCRIPT) as RegionalKey[];

describe("demo scenarios", () => {
  it("has four scenarios with unique IDs", () => {
    expect(DEMO_SCENARIOS).toHaveLength(4);
    expect(new Set(DEMO_SCENARIOS.map((s) => s.id)).size).toBe(4);
  });

  it("can be looked up by ID", () => {
    expect(getDemoScenario("tamil-cardiac")?.languageLabel).toBe("Tamil / Tanglish");
    expect(getDemoScenario("nope")).toBeUndefined();
  });

  it("keeps labels and summaries free of emoji and em dashes", () => {
    for (const s of DEMO_SCENARIOS) {
      for (const text of [s.label, s.languageLabel, s.summary]) {
        expect(text).not.toMatch(/\u2014/);
        expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
      }
    }
  });

  it("uses the caller's words as the transcript", () => {
    for (const s of DEMO_SCENARIOS) {
      expect(s.triage.extracted_caller_transcript).toBe(s.inputText);
    }
  });
});

describe("hospital routing in the scenarios", () => {
  it("only recommends hospitals from the directory, with matching details", () => {
    for (const s of DEMO_SCENARIOS) {
      const routing = s.triage.auto_driver_routing;
      const hospital = getHospitalById(routing.recommended_hospital_id);
      expect(hospital, s.id).toBeDefined();
      expect(routing.recommended_hospital_name).toBe(hospital!.name);
      expect(hospital!.capabilities).toContain(routing.required_capability_matched);
      expect(routing.emergency_gate_instructions).toContain(hospital!.emergency_gate);
    }
  });

  it("includes the directory gate text in the spoken driver direction", () => {
    for (const s of DEMO_SCENARIOS) {
      const routing = s.triage.auto_driver_routing;
      const hospital = getHospitalById(routing.recommended_hospital_id)!;
      expect(routing.spoken_driver_direction_native).toContain(hospital.emergency_gate);
    }
  });

  it("does not claim the hospital accepted the patient", () => {
    for (const s of DEMO_SCENARIOS) {
      expect(s.triage.auto_driver_routing.routing_rationale).toMatch(
        /has not (been contacted|accepted)/i,
      );
    }
  });
});

describe("regional language text", () => {
  it("has spoken guidance in the right script for all four languages", () => {
    for (const s of DEMO_SCENARIOS) {
      const map = s.triage.first_aid_protocol.multilingual_tts_map;
      for (const key of REGIONAL_KEYS) {
        expect(map[key], `${s.id} ${key}`).toMatch(SCRIPT[key]);
      }
    }
  });

  it("has warning banners in the right script for all five languages", () => {
    for (const s of DEMO_SCENARIOS) {
      const b = s.triage.bystander_crowd_control;
      expect(b.danger_banner_en.length).toBeGreaterThan(0);
      expect(b.danger_banner_ta).toMatch(SCRIPT.ta);
      expect(b.danger_banner_hi).toMatch(SCRIPT.hi);
      expect(b.danger_banner_te).toMatch(SCRIPT.te);
      expect(b.danger_banner_ml).toMatch(SCRIPT.ml);
    }
  });

  it("uses the matching regional text as the native instruction", () => {
    for (const s of DEMO_SCENARIOS) {
      const protocol = s.triage.first_aid_protocol;
      const key = getLanguage(s.triage.detected_language_code).key as RegionalKey;
      expect(protocol.spoken_instruction_native).toBe(protocol.multilingual_tts_map[key]);
    }
  });
});

describe("safety rules", () => {
  it("does not turn on the CPR metronome for these scenarios", () => {
    for (const s of DEMO_SCENARIOS) {
      expect(s.triage.first_aid_protocol.requires_cpr_metronome).toBe(false);
    }
  });

  it("gives action steps and cautions for every scenario", () => {
    for (const s of DEMO_SCENARIOS) {
      expect(s.triage.first_aid_protocol.step_by_step_actions.length).toBeGreaterThanOrEqual(4);
      expect(s.triage.first_aid_protocol.safety_caveats.length).toBeGreaterThan(0);
    }
  });

  it("states that the scenario is simulated and that nothing was sent", () => {
    for (const s of DEMO_SCENARIOS) {
      expect(s.triage.assessment_limitations.join(" ")).toMatch(/simulated/i);
      expect(s.triage.civic_dispatch_payload.dispatch_notes).toMatch(/nothing was sent/i);
    }
  });

  it("shows no image findings because no frames were analysed", () => {
    for (const s of DEMO_SCENARIOS) {
      expect(s.triage.visual_evidence_tags).toEqual([]);
      expect(s.triage.scene_assessment.visual_observations).toEqual([]);
    }
  });

  it("only recommends a power cutoff for the electrical scenario", () => {
    const flagged = DEMO_SCENARIOS.filter(
      (s) => s.triage.civic_dispatch_payload.notify_power_utility_cutoff,
    ).map((s) => s.id);
    expect(flagged).toEqual(["telugu-electrical"]);
  });
});

describe("sample prescriptions", () => {
  it("has three samples with unique IDs", () => {
    expect(SAMPLE_PRESCRIPTIONS).toHaveLength(3);
    expect(new Set(SAMPLE_PRESCRIPTIONS.map((p) => p.id)).size).toBe(3);
  });

  it("is linked from every scenario", () => {
    for (const s of DEMO_SCENARIOS) {
      expect(getSamplePrescription(s.suggestedSampleId), s.id).toBeDefined();
    }
  });

  it("asks for confirmation on every reading that is not clear", () => {
    for (const sample of SAMPLE_PRESCRIPTIONS) {
      for (const obs of sample.ocr.medication_observations) {
        if (obs.legibility_status !== "CLEAR") {
          expect(obs.requires_user_confirmation, `${sample.id} ${obs.medication_name}`).toBe(true);
        }
      }
    }
  });

  it("includes a handwritten sample with partial and unreadable lines", () => {
    const sample = getSamplePrescription("sample-handwritten-partial")!;
    const statuses = sample.ocr.medication_observations.map((o) => o.legibility_status);
    expect(statuses).toContain("PARTIALLY_LEGIBLE");
    expect(statuses).toContain("UNREADABLE");
  });

  it("describes the bleeding-risk alerts as concerns for review, not confirmed findings", () => {
    for (const id of ["sample-cardiac-antiplatelet", "sample-head-injury-strip"]) {
      expect(getSamplePrescription(id)!.ocr.critical_drug_trauma_alert).toMatch(
        /not a confirmed finding/i,
      );
    }
  });
});

describe("buildDemoTriage", () => {
  it("adds the app-assigned incident ID", () => {
    const scenario = getDemoScenario("hindi-polytrauma")!;
    expect(buildDemoTriage(scenario, "ZH-TEST").incident_id).toBe("ZH-TEST");
  });

  it("returns a copy, so changing it does not change the scenario", () => {
    const scenario = getDemoScenario("tamil-cardiac")!;
    const result = buildDemoTriage(scenario, "ZH-TEST");
    result.scene_assessment.reported_findings.push("changed");
    result.medical_history_ocr.detected_medications.push("changed");
    expect(scenario.triage.scene_assessment.reported_findings).not.toContain("changed");
    expect(scenario.triage.medical_history_ocr.detected_medications).toEqual([]);
  });
});