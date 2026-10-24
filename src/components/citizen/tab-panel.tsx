"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { TAB_BY_ID, type TabId } from "@/lib/navigation";

interface TabPanelProps {
  id: TabId;
  active: boolean;
  children: ReactNode;
}

/**
 * One tab's content. Panels stay mounted and are only hidden, so switching
 * tabs never resets checked steps, speech or other local state. When a panel
 * becomes active, focus moves to its heading so keyboard and screen reader
 * users land on the new content.
 */
export function TabPanel({ id, active, children }: TabPanelProps) {
  const tab = TAB_BY_ID[id];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current) headingRef.current?.focus();
    wasActive.current = active;
  }, [active]);

  return (
    <section id={`panel-${id}`} aria-labelledby={`heading-${id}`} hidden={!active}>
      <h2 id={`heading-${id}`} ref={headingRef} tabIndex={-1} className="panel-title">
        <span className="text-muted">{tab.number}</span> {tab.label}
      </h2>
      {children}
    </section>
  );
}