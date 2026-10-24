import { describe, expect, it } from "vitest";
import {
  LANGUAGES,
  bannerFor,
  getLanguage,
  pickVoice,
  resolveLanguage,
  spokenInstructionFor,
} from "./languages";
import type { BystanderCrowdControl, FirstAidProtocol } from "./triage-schema";

const crowdControl: BystanderCrowdControl = {
  danger_banner_en: "EN banner",
  danger_banner_ta: "TA banner",
  danger_banner_hi: "HI banner",
  danger_banner_te: "TE banner",
  danger_banner_ml: "ML banner",
  crowd_delegation_task: "task",
};

const protocol: FirstAidProtocol = {
  spoken_instruction_en: "English guidance",
  spoken_instruction_native: "native guidance",
  multilingual_tts_map: { ta: "TA speech", hi: "HI speech", te: "", ml: "ML speech" },
  requires_cpr_metronome: false,
  step_by_step_actions: [],
  safety_caveats: [],
};

describe("languages", () => {
  it("lists the five languages in selector order", () => {
    expect(LANGUAGES.map((l) => l.code)).toEqual([
      "ta-IN",
      "hi-IN",
      "te-IN",
      "ml-IN",
      "en-IN",
    ]);
  });

  it("gives native names and code-mix names", () => {
    expect(getLanguage("ta-IN").nativeName).toBe("தமிழ்");
    expect(getLanguage("ml-IN").codeMixName).toBe("Manglish");
    expect(getLanguage("en-IN").codeMixName).toBeNull();
  });
});

describe("resolveLanguage", () => {
  it("uses the detected language for auto", () => {
    expect(resolveLanguage("auto", "ta-IN")).toBe("ta-IN");
  });

  it("uses the manual choice when one is picked", () => {
    expect(resolveLanguage("hi-IN", "ta-IN")).toBe("hi-IN");
  });
});

describe("bannerFor", () => {
  it("returns the banner for each language", () => {
    expect(bannerFor(crowdControl, "ta-IN")).toBe("TA banner");
    expect(bannerFor(crowdControl, "hi-IN")).toBe("HI banner");
    expect(bannerFor(crowdControl, "te-IN")).toBe("TE banner");
    expect(bannerFor(crowdControl, "ml-IN")).toBe("ML banner");
    expect(bannerFor(crowdControl, "en-IN")).toBe("EN banner");
  });
});

describe("spokenInstructionFor", () => {
  it("returns the regional speech text", () => {
    expect(spokenInstructionFor(protocol, "ta-IN")).toBe("TA speech");
  });

  it("returns English for en-IN", () => {
    expect(spokenInstructionFor(protocol, "en-IN")).toBe("English guidance");
  });

  it("falls back to English when the regional text is empty", () => {
    expect(spokenInstructionFor(protocol, "te-IN")).toBe("English guidance");
  });
});

describe("pickVoice", () => {
  const voices = [{ lang: "en-US" }, { lang: "hi_IN" }, { lang: "ta-IN" }];

  it("prefers an exact locale match, including underscore locales", () => {
    expect(pickVoice(voices, "hi-IN")).toEqual({ lang: "hi_IN" });
  });

  it("falls back to the same language in another region", () => {
    expect(pickVoice(voices, "en-IN")).toEqual({ lang: "en-US" });
  });

  it("returns undefined when the device has no voice for the language", () => {
    expect(pickVoice(voices, "te-IN")).toBeUndefined();
  });
});