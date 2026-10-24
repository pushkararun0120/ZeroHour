import { describe, expect, it } from "vitest";
import { createIncident, patchIncident } from "./incident";
import { getActiveIncident, initialSession, sessionReducer } from "./session";

const make = (id: string) => createIncident({ source: "synthetic-demo", id });

describe("sessionReducer", () => {
  it("adds a new incident at the top and makes it active", () => {
    const a = sessionReducer(initialSession, { type: "incident/upsert", incident: make("A") });
    const b = sessionReducer(a, { type: "incident/upsert", incident: make("B") });
    expect(b.incidents.map((i) => i.incident_id)).toEqual(["B", "A"]);
    expect(b.activeIncidentId).toBe("B");
  });

  it("updates an existing incident in place without a duplicate or a change of active incident", () => {
    const a = sessionReducer(initialSession, { type: "incident/upsert", incident: make("A") });
    const b = sessionReducer(a, { type: "incident/upsert", incident: make("B") });
    const updatedA = patchIncident(make("A"), { status: "active" }, "Updated");
    const next = sessionReducer(b, { type: "incident/upsert", incident: updatedA });

    expect(next.incidents).toHaveLength(2);
    expect(next.incidents.map((i) => i.incident_id)).toEqual(["B", "A"]);
    expect(next.incidents[1].status).toBe("active");
    expect(next.activeIncidentId).toBe("B");
  });

  it("can add an incident without taking over the active one", () => {
    const a = sessionReducer(initialSession, { type: "incident/upsert", incident: make("A") });
    const b = sessionReducer(a, {
      type: "incident/upsert",
      incident: make("B"),
      activate: false,
    });
    expect(b.activeIncidentId).toBe("A");
  });

  it("still activates the first incident when activate is false", () => {
    const a = sessionReducer(initialSession, {
      type: "incident/upsert",
      incident: make("A"),
      activate: false,
    });
    expect(a.activeIncidentId).toBe("A");
  });

  it("selects an existing incident and ignores an unknown one", () => {
    const a = sessionReducer(initialSession, { type: "incident/upsert", incident: make("A") });
    const b = sessionReducer(a, { type: "incident/upsert", incident: make("B") });
    expect(sessionReducer(b, { type: "incident/select", incidentId: "A" }).activeIncidentId).toBe("A");
    expect(sessionReducer(b, { type: "incident/select", incidentId: "Z" })).toBe(b);
  });

  it("clears the active incident when it is removed, and keeps it when another is removed", () => {
    const a = sessionReducer(initialSession, { type: "incident/upsert", incident: make("A") });
    const b = sessionReducer(a, { type: "incident/upsert", incident: make("B") });

    const removedActive = sessionReducer(b, { type: "incident/remove", incidentId: "B" });
    expect(removedActive.activeIncidentId).toBeNull();
    expect(removedActive.incidents.map((i) => i.incident_id)).toEqual(["A"]);

    const removedOther = sessionReducer(b, { type: "incident/remove", incidentId: "A" });
    expect(removedOther.activeIncidentId).toBe("B");
  });
});

describe("getActiveIncident", () => {
  it("returns the active incident, or null when there is none", () => {
    expect(getActiveIncident(initialSession)).toBeNull();
    const a = sessionReducer(initialSession, { type: "incident/upsert", incident: make("A") });
    expect(getActiveIncident(a)?.incident_id).toBe("A");
  });
});