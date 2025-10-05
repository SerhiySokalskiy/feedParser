import { type ClickHouseClient, createClient } from "@clickhouse/client";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export default fp(async (fastify: FastifyInstance) => {
	let clickhouse: ClickHouseClient;

	try {
		clickhouse = createClient({
			url: process.env.CLICKHOUSE_HOST,
			username: process.env.CLICKHOUSE_USER || "default",
			password: process.env.CLICKHOUSE_PASSWORD || "mypassword",
			database: process.env.CLICKHOUSE_DB || "default",
		});

		await clickhouse.query({ query: "SELECT 1" });

		fastify.log.info("✅ ClickHouse connected");

		fastify.decorate("clickhouse", clickhouse);

		fastify.addHook("onClose", async (fastify) => {
			await clickhouse.close();
			fastify.log.info("❌ ClickHouse disconnected");
		});
	} catch (error) {
		fastify.log.error("❌ Error connecting to ClickHouse:", error);
		throw error;
	}
});
