import * as cheerio from "cheerio";
import type { FastifyInstance } from "fastify";

export interface ArticleData {
	title: string;
	text: string[];
	image?: string;
}

export async function parseArticle(
	fastify: FastifyInstance,
	url: string,
): Promise<ArticleData> {
	try {
		const res = await fetch(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117 Safari/537.36",
			},
		});

		if (!res.ok) {
			fastify.log.error(`Fetch error: ${res.status} ${res.statusText}`);
			throw fastify.httpErrors.badGateway("Error fetching news");
		}

		const html = await res.text();
		const $ = cheerio.load(html);

		const title = $("h1").first().text().trim();
		const container = $("div.article-text").first();

		let image: string | undefined;
		const firstImg = container.find("img").first();

		if (firstImg.length) {
			const candidate =
				firstImg.attr("data-src") ||
				firstImg.attr("srcset") ||
				firstImg.attr("src");

			if (
				candidate &&
				!candidate.startsWith("data:") &&
				!/\.svg(\?|$)/i.test(candidate)
			) {
				image = candidate.startsWith("//") ? `https:${candidate}` : candidate;
			}
		}

		const text: string[] = [];
		container.find("p").each((_, el) => {
			const t = $(el).text().trim();
			if (t) text.push(t);
		});

		return { title, image, text };
	} catch (err) {
		fastify.log.error({ err }, "Parse article error");
		throw fastify.httpErrors.internalServerError("Error fetching article");
	}
}
