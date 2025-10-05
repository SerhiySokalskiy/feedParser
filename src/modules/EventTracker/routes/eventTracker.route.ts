import { Parser } from "@json2csv/plainjs/index.js";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { eventFiltersSchema } from "../schemas/eventTracker.schema.js";
import { createEventTrackerService } from "../services/eventCache.service.js";
import { getEventsWithFilters } from "../services/eventDB.service.js";
import type { EventBatch, EventFilters } from "../types/event.types.js";
import { aggregateUniqueEvents } from "../utils/agriigator.js";

export async function eventTrackerRoutes(fastify: FastifyInstance) {
	const eventBatchSchema = {
		type: "array",
		items: {
			type: "object",
			required: [
				"eventType",
				"timestamp",
				"sessionId",
				"pageUrl",
				"userAgent",
				"data",
			],
			properties: {
				eventType: { type: "string" },
				timestamp: { type: "number" },
				sessionId: { type: "string" },
				pageUrl: { type: "string" },
				userAgent: { type: "string" },
				data: { type: "object" },
			},
		},
	};
	const tracker = createEventTrackerService(fastify, { flushInterval: 5000 });
	tracker.startTimer();
	fastify.post<{ Body: EventBatch }>(
		"/events",
		{
			schema: {
				body: eventBatchSchema,
				response: {
					200: {
						type: "object",
						properties: {
							status: { type: "string" },
							received: { type: "number" },
						},
					},
				},
			},
		},
		async (
			request: FastifyRequest<{ Body: EventBatch }>,
			reply: FastifyReply,
		) => {
			try {
				const events = request.body;
				fastify.log.info(
					{ events },
					"[EventTracker] Received events from frontend",
				);

				events.forEach(tracker.track);

				return reply
					.status(200)
					.send({ status: "ok", received: events.length });
			} catch (error) {
				fastify.log.error("[EventTracker] Error receiving events:", error);
				throw error;
			}
		},
	);

	fastify.get<{ Querystring: (typeof eventFiltersSchema)["properties"] }>(
		"/events",
		{
			schema: {
				description: "Fetch events with optional filters",
				tags: ["events"],
				querystring: eventFiltersSchema,
				response: {
					200: {
						type: "object",
						properties: {
							status: { type: "string" },
							totalcount: { type: "integer" },
							events: { type: "array", items: { type: "object" } },
						},
					},
				},
			},
		},
		async (request, reply) => {
			const { ...filters } = request.query as unknown as EventFilters;
			console.log(filters);
			try {
				const events = await getEventsWithFilters(fastify, filters);
				const agg_events = aggregateUniqueEvents(events);
				return reply.send(JSON.stringify(agg_events));
			} catch (err) {
				fastify.log.error(
					"[EventTracker] Error fetching filtered events:",
					err,
				);
				return reply
					.status(500)
					.send({ status: "error", message: "Failed to fetch events" });
			}
		},
	);

	fastify.get<{ Querystring: (typeof eventFiltersSchema)["properties"] }>(
		"/events/export",
		{
			schema: {
				description: "Fetch events with optional filters",
				tags: ["events"],
				querystring: eventFiltersSchema,
				response: {
					200: {
						type: "object",
						properties: {
							status: { type: "string" },
							totalcount: { type: "integer" },
							events: { type: "array", items: { type: "object" } },
						},
					},
				},
			},
		},
		async (request, reply) => {
			const { ...filters } = request.query as unknown as EventFilters;
			console.log(filters);
			try {
				const events = await getEventsWithFilters(fastify, filters);

				const fields = Object.keys(events[0] || {});
				const parser = new Parser({ fields });
				const csv = parser.parse(events);

				reply
					.header("Content-Type", "text/csv")
					.header("Content-Disposition", `attachment; filename="events.csv"`)
					.send(csv);
			} catch (err) {
				fastify.log.error(
					"[EventTracker] Error fetching filtered events:",
					err,
				);
				return reply
					.status(500)
					.send({ status: "error", message: "Failed to fetch events" });
			}
		},
	);
}
