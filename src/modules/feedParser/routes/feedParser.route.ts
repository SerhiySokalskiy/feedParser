import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { saveFeedToDB } from "../services/feed.db.js";
import { parseFeed } from "../services/feed.service.js";
import {
	type FeedItem,
	type FeedQuery,
	FeedQuerySchema,
} from "../types/types.js";

const DEFAULT_URL = "https://rss.nytimes.com/services/xml/rss/nyt/World.xml";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/feed",
		{
			schema: {
				querystring: FeedQuerySchema,
			},
		},
		async (
			request: FastifyRequest<{ Querystring: FeedQuery }>,
			reply: FastifyReply,
		) => {
			const url = request.query.url ?? DEFAULT_URL;
			const force = request.query.force === "1";

			try {
				let feed: FeedItem[] = [];

				if (!force) {
					feed = await fastify.prisma.feed.findMany({
						orderBy: { date: "desc" },
					});

					if (feed.length > 0) {
						return reply.status(200).send({ feed });
					}
				}

				feed = await parseFeed(url);

				saveFeedToDB(fastify.prisma, feed).catch((err) =>
					fastify.log.error({ err }, "Error saving feed to DB"),
				);

				return reply.status(200).send({ feed });
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Internal Server Error";
				fastify.log.error("Feed endpoint error:", error);
				return reply.status(500).send({ error: message });
			}
		},
	);
}
