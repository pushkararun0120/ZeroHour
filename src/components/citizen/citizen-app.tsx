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
    <div className="mx-auto min-h-dvh w-full md:grid md:max-w-5xl md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-8 md:px-6">
      <div className="min-w-0 md:col-start-2 md:row-start-1">
        <header className="px-4 pt-4 md:px-0">
          <h1 className="font-serif text-3xl font-semibold">ZeroHour</h1>
          <p className="mt-1 text-muted">Research prototype. In a real emergency, call 108.</p>
          <div className="mt-3 pb-4">
            <LanguageSelector />
          </div>
        </header>

        <EmergencyIndicator onReturn={setTab} />

        <main
          id="main"
          className="px-4 pb-[calc(11rem+env(safe-area-inset-bottom))] pt-4 md:px-0 md:pb-12"
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

      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:sticky md:top-4 md:z-auto md:col-start-1 md:row-start-1 md:flex-col-reverse md:gap-4 md:self-start md:border-0 md:bg-transparent md:pb-0">
        <AutoPilotBar current={tab} onNavigate={setTab} />
        <TabNav current={tab} onSelect={setTab} />
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}