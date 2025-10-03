import type { TrackedEvent } from "../services/eventCache.service.js";

export type AggregatedEvent = {
	values: Record<keyof TrackedEvent, string>;
	count: number;
};

export function aggregateUniqueEvents(
	events: TrackedEvent[],
): AggregatedEvent[] {
	if (events.length === 0) return [];

	const keys = Array.from(
		new Set(events.flatMap((event) => Object.keys(event))),
	) as (keyof TrackedEvent)[];

	const map = new Map<string, AggregatedEvent>();

	events.forEach((event) => {
		const key = keys.map((k) => String(event[k] ?? "unknown")).join("|");

		const existing = map.get(key);
		if (existing) {
			existing.count += 1;
		} else {
			const values: Record<keyof TrackedEvent, string> = {} as Record<
				keyof TrackedEvent,
				string
			>;
			keys.forEach((k) => {
				values[k] = String(event[k] ?? "unknown");
			});
			map.set(key, { values, count: 1 });
		}
	});

	return Array.from(map.values());
}
