import Parser from "rss-parser";
import type { FeedItem } from "../types/types.js";

const parser = new Parser();

export async function parseFeed(url: string): Promise<FeedItem[]> {
	try {
		const feed = await parser.parseURL(url);
		return feed.items.map((item) => ({
			url: item.link || "",
			title: item.title || "No title",
			contentSnippet: item.contentSnippet || item.content?.slice(0, 200),
			pubDate: item.pubDate,
			image: item.enclosure?.url,
		}));
	} catch (error) {
		console.error("RSS parse error:", error);
		throw error;
	}
}
