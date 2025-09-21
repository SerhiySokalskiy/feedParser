import type { FastifyInstance } from "fastify";
import type { FeedItem } from "../types/types.js";

export async function saveFeedToDB(
	fastify: FastifyInstance,
	feedData: FeedItem[],
) {
	for (const item of feedData) {
		await fastify.prisma.feed.upsert({
			where: { url: item.url },
			update: {
				title: item.title,
				text: item.contentSnippet || "",
				date: item.pubDate ? new Date(item.pubDate) : new Date(),
				image: item.image,
			},
			create: {
				url: item.url,
				title: item.title,
				text: item.contentSnippet || "",
				date: item.pubDate ? new Date(item.pubDate) : new Date(),
				image: item.image,
			},
		});
	}
}

export async function getFeedFromDB(
	fastify: FastifyInstance,
): Promise<FeedItem[]> {
	const records = (await fastify.prisma.feed.findMany()) as FeedItem[];

	return records.map((r) => ({
		url: r.url,
		title: r.title,
		contentSnippet: r.contentSnippet,
		pubDate: r.pubDate,
		image: r.image,
	}));
}
