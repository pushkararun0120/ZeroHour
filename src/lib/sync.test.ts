import { describe, expect, it } from "vitest";
import { createIncident, patchIncident } from "./incident";
import { diffForBroadcast, planBusResponse } from "./sync";

const make = (id: string) => createIncident({ source: "synthetic-demo", id });

describe("planBusResponse for the citizen page", () => {
  it("answers a sync request with every incident, oldest first", () => {
    const newest = make("B");
    const oldest = make("A");
    const plan = planBusResponse("citizen", { type: "sync/request" }, [newest, oldest]);
    expect(plan.actions).toEqual([]);
    expect(
      plan.replies.map((m) => (m.type === "incident/upsert" ? m.incident.incident_id : m.type)),
    ).toEqual(["A", "B"]);
  });

  it("ignores incident messages from other tabs", () => {
    const plan = planBusResponse("citizen", { type: "incident/upsert", incident: make("X") }, []);
    expect(plan).toEqual({ actions: [], replies: [] });
  });
});

describe("planBusResponse for the command page", () => {
  it("adds received incidents without taking over the selection", () => {
    const incident = make("A");
    const plan = planBusResponse("command", { type: "incident/upsert", incident }, []);
    expect(plan.actions).toEqual([{ type: "incident/upsert", incident, activate: false }]);
    expect(plan.replies).toEqual([]);
  });

  it("removes incidents the citizen page removed", () => {
    const plan = planBusResponse("command", { type: "incident/remove", incidentId: "A" }, []);
    expect(plan.actions).toEqual([{ type: "incident/remove", incidentId: "A" }]);
  });

  it("ignores sync requests from other command pages", () => {
    expect(planBusResponse("command", { type: "sync/request" }, [make("A")])).toEqual({
      actions: [],
      replies: [],
    });
  });
});

describe("diffForBroadcast", () => {
  it("sends every incident the first time, oldest first", () => {
    const { messages, posted } = diffForBroadcast(new Map(), [make("B"), make("A")]);
    expect(messages.map((m) => (m.type === "incident/upsert" ? m.incident.incident_id : "?"))).toEqual([
      "A",
      "B",
    ]);
    expect(posted.size).toBe(2);
  });

  it("sends nothing when nothing changed", () => {
    const incidents = [make("A")];
    const first = diffForBroadcast(new Map(), incidents);
    expect(diffForBroadcast(first.posted, incidents).messages).toEqual([]);
  });

  it("sends only the incident that changed", () => {
    const a = make("A");
    const b = make("B");
    const first = diffForBroadcast(new Map(), [b, a]);
    const updatedA = patchIncident(a, { status: "active" }, "Updated");
    const second = diffForBroadcast(first.posted, [b, updatedA]);
    expect(second.messages).toHaveLength(1);
    expect(second.messages[0]).toEqual({ type: "incident/upsert", incident: updatedA });
  });

  it("sends a remove message for an incident that is gone", () => {
    const a = make("A");
    const b = make("B");
    const first = diffForBroadcast(new Map(), [b, a]);
    const second = diffForBroadcast(first.posted, [b]);
    expect(second.messages).toEqual([{ type: "incident/remove", incidentId: "A" }]);
  });

  it("does not change the map that was passed in", () => {
    const posted = new Map();
    diffForBroadcast(posted, [make("A")]);
    expect(posted.size).toBe(0);
  });
});