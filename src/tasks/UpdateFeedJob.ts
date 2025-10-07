import type { FastifyInstance } from "fastify";
import { AsyncTask, CronJob } from "toad-scheduler";

export function createFeedJob(fastify: FastifyInstance) {
	const task = new AsyncTask(
		"feed-updater",
		async () => {
			await updateFeed();
		},
		(err: Error) => {
			fastify.log.error({ err }, "❌ Feed update failed");
		},
	);

	const job = new CronJob({ cronExpression: "*/14 * * * *" }, task);

	return job;
}

async function updateFeed() {
	try {
		const response = await fetch(
			"https://feedparser-bmte.onrender.com/feed?url=https://rss.unian.net/site/news_ukr.rss&force=1",
		);
		if (!response.ok) {
			throw new Error(`Feed update failed with status ${response.status}`);
		}

		const data = await response.text();
		console.log("✅ Feed updated successfully:", data);
		return data;
	} catch (err) {
		console.error("❌ Error updating feed:", err);
		throw err;
	}
}
