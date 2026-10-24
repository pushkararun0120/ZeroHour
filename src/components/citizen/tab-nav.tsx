"use client";

import { FileScan, HeartPulse, Mic, QrCode, ShieldAlert, type LucideIcon } from "lucide-react";
import { TABS, type TabId } from "@/lib/navigation";

const ICONS: Record<TabId, LucideIcon> = {
  capture: Mic,
  "first-aid": HeartPulse,
  "crowd-shield": ShieldAlert,
  "med-scan": FileScan,
  "er-handoff": QrCode,
};

interface TabNavProps {
  current: TabId;
  onSelect: (tab: TabId) => void;
}

/** Bottom bar on phones, vertical rail on larger screens. Every item shows a text label. */
export function TabNav({ current, onSelect }: TabNavProps) {
  return (
    <nav aria-label="Emergency steps" className="bg-surface md:border md:border-line">
      <ul className="grid grid-cols-5 md:grid-cols-1 md:gap-1 md:p-1">
        {TABS.map((tab) => {
          const Icon = ICONS[tab.id];
          const isCurrent = tab.id === current;
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-1 border-t-4 px-1 py-2 text-center text-[0.8125rem] leading-tight md:min-h-12 md:flex-row md:justify-start md:gap-3 md:border-t-0 md:border-l-4 md:px-3 md:text-left md:text-base ${
                  isCurrent
                    ? "border-navy bg-info-tint font-semibold text-navy"
                    : "border-transparent text-ink hover:bg-paper"
                }`}
              >
                <Icon size={22} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
                <span>
                  {tab.number} {tab.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}