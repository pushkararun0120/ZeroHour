import { z } from "zod";
import type { Incident } from "./incident";
import { incidentSchema } from "./schemas";

export const BUS_CHANNEL_NAME = "zerohour_emergency_bus";
export const BUS_STORAGE_KEY = "zerohour_emergency_bus_message";

export type BusMessage =
  | { type: "incident/upsert"; incident: Incident }
  | { type: "incident/remove"; incidentId: string }
  | { type: "sync/request" };

const busMessageSchema: z.ZodType<BusMessage> = z.discriminatedUnion("type", [
  z.object({ type: z.literal("incident/upsert"), incident: incidentSchema }),
  z.object({ type: z.literal("incident/remove"), incidentId: z.string().min(1).max(100) }),
  z.object({ type: z.literal("sync/request") }),
]);

/** Returns the message if it has the right shape, otherwise null. */
export function parseBusMessage(data: unknown): BusMessage | null {
  const result = busMessageSchema.safeParse(data);
  return result.success ? result.data : null;
}

export interface EmergencyBus {
  post(message: BusMessage): void;
  close(): void;
}

/**
 * Same-browser sync between tabs and windows on this origin. It does not
 * connect separate devices. Call it from an effect, never during server render.
 */
export function createBus(onMessage: (message: BusMessage) => void): EmergencyBus {
  const channel =
    typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(BUS_CHANNEL_NAME);

  const handleChannel = (event: MessageEvent<unknown>) => {
    const message = parseBusMessage(event.data);
    if (message) onMessage(message);
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== BUS_STORAGE_KEY || !event.newValue) return;
    try {
      const message = parseBusMessage(JSON.parse(event.newValue));
      if (message) onMessage(message);
    } catch {
      // Ignore malformed data.
    }
  };

  if (channel) {
    channel.addEventListener("message", handleChannel);
  } else {
    window.addEventListener("storage", handleStorage);
  }

  return {
    post(message) {
      if (channel) {
        channel.postMessage(message);
        return;
      }
      try {
        window.localStorage.setItem(BUS_STORAGE_KEY, JSON.stringify(message));
        window.localStorage.removeItem(BUS_STORAGE_KEY);
      } catch {
        // Storage is unavailable, so there is nothing to sync through.
      }
    },
    close() {
      if (channel) {
        channel.removeEventListener("message", handleChannel);
        channel.close();
      } else {
        window.removeEventListener("storage", handleStorage);
      }
    },
  };
}