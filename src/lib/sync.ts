import type { BusMessage } from "./broadcast";
import type { Incident } from "./incident";
import type { SessionAction } from "./session";

export type SessionRole = "citizen" | "command";

export interface BusPlan {
  /** Changes to apply to this tab's own state. */
  actions: SessionAction[];
  /** Messages to send back on the channel. */
  replies: BusMessage[];
}

function upsertMessages(incidents: readonly Incident[]): BusMessage[] {
  // The list is newest first. Sending oldest first keeps the same order on the other side.
  return [...incidents].reverse().map((incident) => ({ type: "incident/upsert", incident }));
}

/**
 * Decides what a tab does with a message. The citizen page owns the incidents
 * and only answers sync requests. The command page only receives.
 */
export function planBusResponse(
  role: SessionRole,
  message: BusMessage,
  incidents: readonly Incident[],
): BusPlan {
  if (role === "citizen") {
    return message.type === "sync/request"
      ? { actions: [], replies: upsertMessages(incidents) }
      : { actions: [], replies: [] };
  }

  switch (message.type) {
    case "incident/upsert":
      return {
        actions: [{ type: "incident/upsert", incident: message.incident, activate: false }],
        replies: [],
      };
    case "incident/remove":
      return {
        actions: [{ type: "incident/remove", incidentId: message.incidentId }],
        replies: [],
      };
    case "sync/request":
      return { actions: [], replies: [] };
  }
}

/**
 * Compares the incidents with what was already sent and returns only the
 * messages that are needed. An incident counts as changed when it is a new
 * object, which is what patchIncident always returns.
 */
export function diffForBroadcast(
  posted: ReadonlyMap<string, Incident>,
  incidents: readonly Incident[],
): { messages: BusMessage[]; posted: Map<string, Incident> } {
  const next = new Map<string, Incident>();
  const changed: Incident[] = [];

  for (const incident of incidents) {
    next.set(incident.incident_id, incident);
    if (posted.get(incident.incident_id) !== incident) changed.push(incident);
  }

  const removed: BusMessage[] = [...posted.keys()]
    .filter((id) => !next.has(id))
    .map((incidentId) => ({ type: "incident/remove", incidentId }));

  return { messages: [...upsertMessages(changed), ...removed], posted: next };
}