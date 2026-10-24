import type { TabId } from "@/lib/navigation";
import { TabPanel } from "../tab-panel";

interface PlaceholderPanelProps {
  id: TabId;
  active: boolean;
  description: string;
}

/** Stand-in for a tab that is built in a later step. */
export function PlaceholderPanel({ id, active, description }: PlaceholderPanelProps) {
  return (
    <TabPanel id={id} active={active}>
      <p className="panel mt-4">{description}</p>
    </TabPanel>
  );
}