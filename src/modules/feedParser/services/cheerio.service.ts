import axios from "axios";
import * as cheerio from "cheerio";

export interface ArticleData {
	title: string;
	text: string[];
	image?: string;
}

export async function parseArticle(url: string): Promise<ArticleData> {
	try {
		const { data: html } = await axios.get(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117 Safari/537.36",
			},
		});

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
	} catch (error) {
		console.error("Parse article error:", error);
		throw new Error("Не вдалося отримати статтю");
	}
}
