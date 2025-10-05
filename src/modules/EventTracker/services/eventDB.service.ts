import type { FastifyInstance } from "fastify";
import type { EventFilters } from "../types/event.types.js";
import type { TrackedEvent } from "./eventCache.service.js";

export async function insertEvents(
	fastify: FastifyInstance,
	events: TrackedEvent[],
) {
	if (events.length === 0) return;

	try {
		await fastify.clickhouse.insert({
			table: "events",
			values: events.map((e) => ({
				event_type: e.eventType,
				timestamp: new Date(e.timestamp)
					.toISOString()
					.slice(0, 19)
					.replace("T", " "),
				session_id: e.sessionId,
				page_url: e.pageUrl,
				user_agent: e.userAgent,
				data: JSON.stringify(e.data),
			})),
			format: "JSONEachRow",
		});
		fastify.log.info(
			`[EventDB] Inserted ${events.length} events to ClickHouse`,
		);
	} catch (err) {
		fastify.log.error("[EventDB] Error inserting events:", err);
		throw err;
	}
}
export async function getAllEvents(fastify: FastifyInstance) {
	try {
		const query = `
      SELECT 
        event_type   AS eventType,
        timestamp,
        session_id   AS sessionId,
        page_url     AS pageUrl,
        user_agent   AS userAgent,
        data
      FROM events
      ORDER BY timestamp DESC
    `;

		const result = await fastify.clickhouse.query({
			query,
			format: "JSONEachRow",
		});
		const rows = await result.json();

		fastify.log.info(`[EventDB] Fetched ${rows.length} events from ClickHouse`);

		return rows;
	} catch (err) {
		fastify.log.error("[EventDB] Error fetching events:", err);
		throw err;
	}
}

function escapeString(str: string) {
	return str.replace(/'/g, "''");
}

export async function getEventsWithFilters(
	fastify: FastifyInstance,
	filters: EventFilters,
): Promise<TrackedEvent[]> {
	try {
		const conditions: string[] = [];
		const fields: string[] = [];

		if (filters.eventType) {
			if (filters.eventType !== "all") {
				conditions.push(`event_type = '${escapeString(filters.eventType)}'`);
			}
			fields.push(" event_type AS eventType");
		}
		if (filters.pageUrl) {
			if (filters.pageUrl !== "all") {
				conditions.push(`page_url = '${escapeString(filters.pageUrl.trim())}'`);
			}
			fields.push(" page_url AS pageUrl");
		}
		if (filters.timestamp) {
			fields.push(" timestamp AS timestamp");
		}
		if (filters.data) {
			fields.push(" data");
		}
		if (filters.sessionId) {
			fields.push(" session_id AS sessionId");
		}
		if (filters.userAgent) {
			fields.push(" user_agent AS userAgent");
		}

		const whereClause = conditions.length
			? `WHERE ${conditions.join(" AND ")}`
			: "";

		const query = `
      SELECT
        ${fields}
      FROM events
      ${whereClause}
      ORDER BY timestamp DESC
    `;
		console.log(query);
		const result = await fastify.clickhouse.query({
			query,
			format: "JSONEachRow",
		});

		const rows = (await result.json()) as TrackedEvent[];
		fastify.log.info(`[EventDB] Fetched ${rows.length} events with filters`);
		return rows;
	} catch (err) {
		fastify.log.error("[EventDB] Error fetching events with filters:", err);
		throw err;
	}
}
