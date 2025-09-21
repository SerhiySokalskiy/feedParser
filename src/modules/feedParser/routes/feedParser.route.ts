import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { saveFeedToDB } from "../services/feed.db.js";
import { parseFeed } from "../services/feed.service.js";
import type { FeedItem } from "../types/types.js";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/feed",
		{
			schema: {
				querystring: {
					type: "object",
					properties: {
						url: { type: "string", format: "uri" },
						force: { type: "string", enum: ["0", "1"] },
					},
					additionalProperties: false,
				},
			},
		},
		async (
			request: FastifyRequest<{
				Querystring: { url?: string; force?: "0" | "1" };
			}>,
			reply: FastifyReply,
		) => {
			const url = request.query.url ?? fastify.config.DEFAULT_FEED_URL;
			const force = request.query.force === "1";

			try {
				let feed: FeedItem[] = [];

				if (!force) {
					const feedFromDB = await fastify.prisma.feed.findMany({
						orderBy: { date: "desc" },
					});

					if (feedFromDB.length > 0) {
						return reply.status(200).send({ feed: feedFromDB });
					}
				}

				feed = await parseFeed(url);

				await saveFeedToDB(fastify, feed);

				const feedFromDB = await fastify.prisma.feed.findMany({
					orderBy: { date: "desc" },
				});
				return reply.status(200).send({ feed: feedFromDB });
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Internal Server Error";
				fastify.log.error("Feed endpoint error:", error);
				return reply.status(500).send({ error: message });
			}
		},
	);
}
