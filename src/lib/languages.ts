import type {
  BystanderCrowdControl,
  FirstAidProtocol,
  LanguageCode,
} from "./triage-schema";

/** What the user picked in the selector. "auto" means use the detected language. */
export type SelectedLanguage = LanguageCode | "auto";

export interface LanguageInfo {
  code: LanguageCode;
  /** Key used in the schema's multilingual_tts_map. */
  key: "ta" | "hi" | "te" | "ml" | "en";
  englishName: string;
  nativeName: string;
  /** Text shown on the selector button. */
  shortLabel: string;
  /** Common name for code-mixed speech, or null for English. */
  codeMixName: string | null;
}

export const LANGUAGE_INFO: Record<LanguageCode, LanguageInfo> = {
  "ta-IN": {
    code: "ta-IN",
    key: "ta",
    englishName: "Tamil",
    nativeName: "தமிழ்",
    shortLabel: "தமிழ்",
    codeMixName: "Tanglish",
  },
  "hi-IN": {
    code: "hi-IN",
    key: "hi",
    englishName: "Hindi",
    nativeName: "हिन्दी",
    shortLabel: "हिन्दी",
    codeMixName: "Hinglish",
  },
  "te-IN": {
    code: "te-IN",
    key: "te",
    englishName: "Telugu",
    nativeName: "తెలుగు",
    shortLabel: "తెలుగు",
    codeMixName: "Tenglish",
  },
  "ml-IN": {
    code: "ml-IN",
    key: "ml",
    englishName: "Malayalam",
    nativeName: "മലയാളം",
    shortLabel: "മലയാളം",
    codeMixName: "Manglish",
  },
  "en-IN": {
    code: "en-IN",
    key: "en",
    englishName: "English",
    nativeName: "English",
    shortLabel: "EN",
    codeMixName: null,
  },
};

/** Languages in selector order. */
export const LANGUAGES: readonly LanguageInfo[] = Object.values(LANGUAGE_INFO);

export function getLanguage(code: LanguageCode): LanguageInfo {
  return LANGUAGE_INFO[code];
}

/** Turns the selector value into a real language, using the detected one for "auto". */
export function resolveLanguage(
  selected: SelectedLanguage,
  detected: LanguageCode,
): LanguageCode {
  return selected === "auto" ? detected : selected;
}

const BANNER_FIELD = {
  "ta-IN": "danger_banner_ta",
  "hi-IN": "danger_banner_hi",
  "te-IN": "danger_banner_te",
  "ml-IN": "danger_banner_ml",
  "en-IN": "danger_banner_en",
} as const satisfies Record<LanguageCode, keyof BystanderCrowdControl>;

/** Warning banner text for a language. */
export function bannerFor(
  crowdControl: BystanderCrowdControl,
  language: LanguageCode,
): string {
  return crowdControl[BANNER_FIELD[language]];
}

/** First-aid text to speak for a language. Falls back to English if the text is empty. */
export function spokenInstructionFor(
  protocol: FirstAidProtocol,
  language: LanguageCode,
): string {
  if (language === "en-IN") return protocol.spoken_instruction_en;
  const key = LANGUAGE_INFO[language].key as keyof FirstAidProtocol["multilingual_tts_map"];
  return protocol.multilingual_tts_map[key] || protocol.spoken_instruction_en;
}

function normaliseLocale(locale: string): string {
  return locale.replace("_", "-").toLowerCase();
}

/**
 * Picks the best speech voice for a locale: an exact match first, then any
 * voice for the same language. Returns undefined when the device has none,
 * so the UI can show a clear "no voice available" message.
 */
export function pickVoice<T extends { lang: string }>(
  voices: readonly T[],
  locale: string,
): T | undefined {
  const wanted = normaliseLocale(locale);
  const exact = voices.find((voice) => normaliseLocale(voice.lang) === wanted);
  if (exact) return exact;
  const language = wanted.split("-")[0];
  return voices.find((voice) => normaliseLocale(voice.lang).split("-")[0] === language);
}