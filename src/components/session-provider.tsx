"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createBus, type EmergencyBus } from "@/lib/broadcast";
import type { Incident } from "@/lib/incident";
import type { SelectedLanguage } from "@/lib/languages";
import { getActiveIncident, initialSession, sessionReducer } from "@/lib/session";
import { diffForBroadcast, planBusResponse, type SessionRole } from "@/lib/sync";

interface SessionContextValue {
  incidents: Incident[];
  activeIncident: Incident | null;
  language: SelectedLanguage;
  setLanguage: (language: SelectedLanguage) => void;
  upsertIncident: (incident: Incident, options?: { activate?: boolean }) => void;
  selectIncident: (incidentId: string) => void;
  removeIncident: (incidentId: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  /** The citizen page owns incidents and broadcasts them. The command page receives them. */
  role: SessionRole;
  children: ReactNode;
}

/** Holds the incidents, the active incident and the language for one page. */
export function SessionProvider({ role, children }: SessionProviderProps) {
  const [state, dispatch] = useReducer(sessionReducer, initialSession);
  const [language, setLanguage] = useState<SelectedLanguage>("auto");

  const busRef = useRef<EmergencyBus | null>(null);
  const postedRef = useRef<Map<string, Incident>>(new Map());
  const incidentsRef = useRef<Incident[]>([]);

  useEffect(() => {
    incidentsRef.current = state.incidents;
  }, [state.incidents]);

  // Open the same-browser channel. The command page asks for what it missed.
  useEffect(() => {
    const bus: EmergencyBus = createBus((message) => {
      const plan = planBusResponse(role, message, incidentsRef.current);
      plan.actions.forEach(dispatch);
      plan.replies.forEach((reply) => bus.post(reply));
    });
    busRef.current = bus;
    if (role === "command") bus.post({ type: "sync/request" });
    return () => {
      bus.close();
      busRef.current = null;
    };
  }, [role]);

  // The citizen page sends only new or changed incidents.
  useEffect(() => {
    if (role !== "citizen") return;
    const bus = busRef.current;
    if (!bus) return;
    const { messages, posted } = diffForBroadcast(postedRef.current, state.incidents);
    postedRef.current = posted;
    messages.forEach((message) => bus.post(message));
  }, [role, state.incidents]);

  const upsertIncident = useCallback(
    (incident: Incident, options?: { activate?: boolean }) =>
      dispatch({ type: "incident/upsert", incident, activate: options?.activate }),
    [],
  );
  const selectIncident = useCallback(
    (incidentId: string) => dispatch({ type: "incident/select", incidentId }),
    [],
  );
  const removeIncident = useCallback(
    (incidentId: string) => dispatch({ type: "incident/remove", incidentId }),
    [],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      incidents: state.incidents,
      activeIncident: getActiveIncident(state),
      language,
      setLanguage,
      upsertIncident,
      selectIncident,
      removeIncident,
    }),
    [state, language, upsertIncident, selectIncident, removeIncident],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside a SessionProvider");
  return value;
}