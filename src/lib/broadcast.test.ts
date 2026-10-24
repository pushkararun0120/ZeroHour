import { describe, expect, it } from "vitest";
import { parseBusMessage } from "./broadcast";
import { DEMO_SCENARIOS, buildDemoTriage } from "./demo-scenarios";
import { createIncident, patchIncident } from "./incident";

const incident = patchIncident(
  createIncident({ source: "synthetic-demo", id: "ZH-TEST" }),
  { triage: buildDemoTriage(DEMO_SCENARIOS[0], "ZH-TEST"), status: "active" },
);

describe("parseBusMessage", () => {
  it("accepts an incident update", () => {
    const message = parseBusMessage({ type: "incident/upsert", incident });
    expect(message?.type).toBe("incident/upsert");
  });

  it("accepts a remove message and a sync request", () => {
    expect(parseBusMessage({ type: "incident/remove", incidentId: "ZH-TEST" })).toEqual({
      type: "incident/remove",
      incidentId: "ZH-TEST",
    });
    expect(parseBusMessage({ type: "sync/request" })).toEqual({ type: "sync/request" });
  });

  it("rejects an unknown message type", () => {
    expect(parseBusMessage({ type: "something/else" })).toBeNull();
  });

  it("rejects an incident that fails the checks", () => {
    expect(
      parseBusMessage({ type: "incident/upsert", incident: { ...incident, status: "done" } }),
    ).toBeNull();
  });

  it("rejects values that are not messages at all", () => {
    expect(parseBusMessage(null)).toBeNull();
    expect(parseBusMessage("hello")).toBeNull();
    expect(parseBusMessage({})).toBeNull();
  });
});