import { TabPanel } from "../tab-panel";
import { DemoScenarioList } from "../demo-scenario-list";

interface CapturePanelProps {
  active: boolean;
  onIncidentStarted: () => void;
}

export function CapturePanel({ active, onIncidentStarted }: CapturePanelProps) {
  return (
    <TabPanel id="capture" active={active}>
      <p className="note mt-4">
        Live camera and microphone capture is added in a later step. Use a simulated scenario below
        to try the full flow now.
      </p>
      <DemoScenarioList onStarted={onIncidentStarted} />
    </TabPanel>
  );
}