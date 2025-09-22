import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { parseArticle } from "../services/cheerio.service.js";
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

	fastify.get(
		"/feed/:id",
		{
			schema: {
				params: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
					required: ["id"],
					additionalProperties: false,
				},
				response: {
					200: {
						type: "object",
						properties: {
							title: { type: "string" },
							text: {
								type: "array",
								items: { type: "string" },
							},
							image: { type: "string", nullable: true },
						},
						required: ["title", "text"],
					},
					404: {
						type: "object",
						properties: {
							message: { type: "string" },
						},
						required: ["message"],
					},
				},
			},
		},
		async (
			request: FastifyRequest<{ Params: { id: number } }>,
			reply: FastifyReply,
		) => {
			try {
				const { id } = request.params;

				const feedItem = await fastify.prisma.feed.findUnique({
					where: { id },
				});

				if (!feedItem) {
					return reply
						.status(404)
						.send({ message: "There isnt such an article" });
				}

				const article = await parseArticle(feedItem.url);

				return reply.status(200).send(article);
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Internal Server Error";
				fastify.log.error("Feed by id error:", error);
				return reply.status(500).send({ error: message });
			}
		},
	);
}
