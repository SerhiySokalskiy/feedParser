import type { FastifyInstance } from "fastify";
import type { EventPayloads } from "../types/event.types.js";
import { insertEvents } from "./eventDB.service.js";

export type EventName = keyof EventPayloads;

export type TrackedEvent<T extends EventName = EventName> = {
  eventType: T;
  timestamp: number;
  sessionId: string;
  pageUrl: string;
  userAgent: string;
  data: EventPayloads[T];
};

export function createEventTrackerService(
  fastify: FastifyInstance,
  options?: { maxBatchSize?: number; flushInterval?: number }
) {
  const cache: TrackedEvent[] = [];
  const maxBatchSize = options?.maxBatchSize ?? 20;
  const flushInterval = options?.flushInterval ?? 5000;
  let timerId: NodeJS.Timeout;

  async function flush() {
    if (cache.length === 0) return;
    const batch = cache.splice(0, cache.length);
    try {
      await insertEvents(fastify, batch);
    } catch {
      cache.unshift(...batch);
    }
  }

  function track(event: TrackedEvent) {
    cache.push(event);
    fastify.log.info(`[EventTracker] Tracked event: ${event.eventType}`);
    if (cache.length >= maxBatchSize) flush();
  }

  function startTimer() {
    timerId = setInterval(flush, flushInterval);
  }

  function stopTimer() {
    if (timerId) clearInterval(timerId);
  }

  return {
    track,
    flush,
    startTimer,
    stopTimer,
  };
}
