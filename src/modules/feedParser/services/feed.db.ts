import type { PrismaClient } from "@prisma/client";
import type { FeedItem } from "../types/types";

export async function saveFeedToDB(prisma: PrismaClient, feedData: FeedItem[]) {
	for (const item of feedData) {
		await prisma.feed.create({
			data: {
				title: item.title,
				text: item.contentSnippet || "",
				date: item.pubDate ? new Date(item.pubDate) : new Date(),
			},
		});
	}
}

export async function getFeedFromDB(prisma: PrismaClient): Promise<FeedItem[]> {
	const records = await prisma.feed.findMany();

	type FeedRecord = Awaited<
		ReturnType<PrismaClient["feed"]["findMany"]>
	>[number];

	return records.map((r: FeedRecord) => ({
		title: r.title,
		contentSnippet: r.text,
		pubDate: r.date.toISOString(),
	}));
}
