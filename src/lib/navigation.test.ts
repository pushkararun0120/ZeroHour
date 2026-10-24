import { describe, expect, it } from "vitest";
import { getDemoScenario, getSamplePrescription } from "./demo-scenarios";
import { startDemoIncident } from "./demo-incident";
import { createIncident, patchIncident } from "./incident";
import { emergencyTab, getAutoPilotStep, TABS, TAB_BY_ID, type TabId } from "./navigation";
import { applyOcrToIncident } from "./ocr";

const demo = () => startDemoIncident(getDemoScenario("tamil-cardiac")!);

describe("tabs", () => {
  it("has five tabs in order with numbers and labels", () => {
    expect(TABS.map((t) => `${t.number} ${t.label}`)).toEqual([
      "01 Capture",
      "02 First Aid",
      "03 Crowd Shield",
      "04 Med Scan",
      "05 ER Handoff",
    ]);
  });

  it("can be looked up by ID", () => {
    expect(TAB_BY_ID["med-scan"].label).toBe("Med Scan");
  });
});

describe("emergencyTab", () => {
  it("goes to First Aid once there is a triage result", () => {
    expect(emergencyTab(demo())).toBe("first-aid");
  });

  it("goes to Capture when there is no incident or no result yet", () => {
    expect(emergencyTab(null)).toBe("capture");
    expect(emergencyTab(createIncident({ source: "live-gemini" }))).toBe("capture");
  });
});

describe("getAutoPilotStep", () => {
  it("asks to start an emergency when there is no incident", () => {
    const onCapture = getAutoPilotStep("capture", null);
    expect(onCapture.target).toBeNull();
    expect(onCapture.title).toBe("Start an emergency");

    const elsewhere = getAutoPilotStep("crowd-shield", null);
    expect(elsewhere.target).toBe("capture");
  });

  it("waits while the triage result is still coming", () => {
    const step = getAutoPilotStep("capture", createIncident({ source: "live-gemini" }));
    expect(step.target).toBeNull();
    expect(step.title).toBe("Processing");
  });

  it("sends the user back to Capture after an error and shows the error", () => {
    const failed = patchIncident(createIncident({ source: "live-gemini" }), {
      status: "error",
      error: "Camera was blocked.",
    });
    const step = getAutoPilotStep("capture", failed);
    expect(step.target).toBe("capture");
    expect(step.detail).toBe("Camera was blocked.");
  });

  it("moves one tab forward at a time through the five steps", () => {
    const incident = demo();
    const path: TabId[] = ["capture"];
    let current: TabId = "capture";
    for (let i = 0; i < 4; i += 1) {
      current = getAutoPilotStep(current, incident).target as TabId;
      path.push(current);
    }
    expect(path).toEqual(["capture", "first-aid", "crowd-shield", "med-scan", "er-handoff"]);
  });

  it("goes back to First Aid from the last step", () => {
    const step = getAutoPilotStep("er-handoff", demo());
    expect(step.target).toBe("first-aid");
    expect(step.title).toBe("Back to 02 First Aid");
  });

  it("calls the scan optional until a reading needs review", () => {
    const incident = demo();
    expect(getAutoPilotStep("crowd-shield", incident).detail).toBe(
      "Optional. Scan a prescription or tablet strip.",
    );

    const scanned = applyOcrToIncident(
      incident,
      getSamplePrescription("sample-cardiac-antiplatelet")!.ocr,
      { kind: "gemini" },
    )!;
    expect(getAutoPilotStep("crowd-shield", scanned).detail).toBe(
      "1 medicine reading needs review.",
    );
  });

  it("does not depend on which tabs were opened before", () => {
    const incident = demo();
    expect(getAutoPilotStep("first-aid", incident)).toEqual(getAutoPilotStep("first-aid", incident));
    expect(getAutoPilotStep("first-aid", incident).target).toBe("crowd-shield");
  });
});