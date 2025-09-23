import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
	getArticleByIdSchema,
	getFeedSchema,
} from "../schemas/getFeedData.schema.js";
import { parseArticle } from "../services/cheerio.service.js";
import { saveFeedToDB } from "../services/feed.db.js";
import { parseFeed } from "../services/feed.service.js";
import type { FeedItem } from "../types/types.js";

export async function getFeedDataRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/feed",
		{
			schema: getFeedSchema,
		},
		async (
			request: FastifyRequest<{
				Querystring: { url?: string; force?: "0" | "1" };
			}>,
			_reply: FastifyReply,
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
						return { feed: feedFromDB };
					}
				}

				feed = await parseFeed(url);

				await saveFeedToDB(fastify, feed);

				const feedFromDB = await fastify.prisma.feed.findMany({
					orderBy: { date: "desc" },
				});

				return { feed: feedFromDB };
			} catch (err) {
				fastify.log.error("Feed endpoint error:", err);
				throw fastify.httpErrors.internalServerError("Error fetching news");
			}
		},
	);

	fastify.get(
		"/feed/:id",
		{
			schema: getArticleByIdSchema,
		},
		async (request: FastifyRequest<{ Params: { id: number } }>) => {
			try {
				const { id } = request.params;

				const feedItem = await fastify.prisma.feed.findUnique({
					where: { id },
				});

				if (!feedItem) {
					throw fastify.httpErrors.notFound("There isnt such an article");
				}

				const article = await parseArticle(fastify, feedItem.url);

				return article;
			} catch (err) {
				fastify.log.error("Feed by id error:", err);
				throw fastify.httpErrors.internalServerError("Error fetching article");
			}
		},
	);
}
