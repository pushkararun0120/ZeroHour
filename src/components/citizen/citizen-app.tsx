"use client";

import { useState } from "react";
import { useSession } from "@/components/session-provider";
import { TAB_BY_ID, type TabId } from "@/lib/navigation";
import { AutoPilotBar } from "./autopilot-bar";
import { EmergencyIndicator } from "./emergency-indicator";
import { LanguageSelector } from "./language-selector";
import { CapturePanel } from "./panels/capture-panel";
import { PlaceholderPanel } from "./panels/placeholder-panel";
import { TabNav } from "./tab-nav";

export function CitizenApp() {
  const { activeIncident } = useSession();
  const [tab, setTab] = useState<TabId>("capture");

  const current = TAB_BY_ID[tab];
  const announcement = `${current.number} ${current.label} opened. ${
    activeIncident ? `Active incident ${activeIncident.incident_id}.` : "No active incident."
  }`;

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[16rem_minmax(0,1fr)] lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="min-w-0 md:col-start-2 md:row-start-1">
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-x-8 gap-y-3 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-8 md:py-5">
            <div>
              <h1 className="text-xl font-semibold md:text-2xl">ZeroHour</h1>
              <p className="text-muted">Research prototype. In a real emergency, call 108.</p>
            </div>
            <LanguageSelector />
          </div>
        </header>

        <EmergencyIndicator onReturn={setTab} />

        <main
          id="main"
          className="mx-auto w-full max-w-6xl px-4 pb-[calc(14rem+env(safe-area-inset-bottom))] pt-6 md:px-8 md:pb-16 md:pt-8"
        >
          <CapturePanel active={tab === "capture"} onIncidentStarted={() => setTab("first-aid")} />
          <PlaceholderPanel
            id="first-aid"
            active={tab === "first-aid"}
            description="Spoken guidance, checkable steps and the 110 BPM metronome will appear here."
          />
          <PlaceholderPanel
            id="crowd-shield"
            active={tab === "crowd-shield"}
            description="The multilingual bystander warning will appear here."
          />
          <PlaceholderPanel
            id="med-scan"
            active={tab === "med-scan"}
            description="Prescription and medicine strip scanning will appear here."
          />
          <PlaceholderPanel
            id="er-handoff"
            active={tab === "er-handoff"}
            description="Hospital match, directions, triage card and QR handoff will appear here."
          />
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:sticky md:inset-x-auto md:bottom-auto md:top-0 md:z-auto md:col-start-1 md:row-start-1 md:flex md:h-dvh md:flex-col md:gap-4 md:self-start md:overflow-y-auto md:border-r md:border-t-0 md:p-4">
        <AutoPilotBar current={tab} onNavigate={setTab} />
        <TabNav current={tab} onSelect={setTab} />
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}