"use client";

import { useSession } from "@/components/session-provider";
import { LANGUAGES, type SelectedLanguage } from "@/lib/languages";

interface Option {
  value: SelectedLanguage;
  label: string;
  lang: string;
  spokenName: string;
}

const OPTIONS: Option[] = [
  { value: "auto", label: "Auto-Detect", lang: "en", spokenName: "Auto-detect" },
  ...LANGUAGES.map((language) => ({
    value: language.code,
    label: language.shortLabel,
    lang: language.code,
    spokenName: language.englishName,
  })),
];

export function LanguageSelector() {
  const { language, setLanguage } = useSession();

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-sm font-semibold text-muted">Language</legend>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name="language"
              value={option.value}
              checked={language === option.value}
              onChange={() => setLanguage(option.value)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              lang={option.lang}
              className="flex min-h-12 min-w-12 cursor-pointer items-center justify-center rounded border border-line-strong bg-surface px-3 text-base font-medium hover:bg-paper peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
            >
              {option.label}
            </span>
            <span className="sr-only">{option.spokenName}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}