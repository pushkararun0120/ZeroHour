import type { Incident } from "./incident";

export interface SessionState {
  incidents: Incident[];
  activeIncidentId: string | null;
}

export const initialSession: SessionState = { incidents: [], activeIncidentId: null };

export type SessionAction =
  | {
      type: "incident/upsert";
      incident: Incident;
      /** A new incident becomes the active one unless this is false. */
      activate?: boolean;
    }
  | { type: "incident/select"; incidentId: string }
  | { type: "incident/remove"; incidentId: string };

/**
 * Keeps the incidents for this session. The incident ID is the only key, so
 * updating an incident (for example after a prescription scan) replaces the
 * existing record and never creates a duplicate.
 */
export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "incident/upsert": {
      const { incident } = action;
      const exists = state.incidents.some((item) => item.incident_id === incident.incident_id);
      if (exists) {
        return {
          ...state,
          incidents: state.incidents.map((item) =>
            item.incident_id === incident.incident_id ? incident : item,
          ),
        };
      }
      const activate = action.activate !== false || state.activeIncidentId === null;
      return {
        incidents: [incident, ...state.incidents],
        activeIncidentId: activate ? incident.incident_id : state.activeIncidentId,
      };
    }
    case "incident/select": {
      const exists = state.incidents.some((item) => item.incident_id === action.incidentId);
      return exists ? { ...state, activeIncidentId: action.incidentId } : state;
    }
    case "incident/remove": {
      return {
        incidents: state.incidents.filter((item) => item.incident_id !== action.incidentId),
        activeIncidentId:
          state.activeIncidentId === action.incidentId ? null : state.activeIncidentId,
      };
    }
  }
}

export function getActiveIncident(state: SessionState): Incident | null {
  return state.incidents.find((item) => item.incident_id === state.activeIncidentId) ?? null;
}