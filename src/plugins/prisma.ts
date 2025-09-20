// src/plugins/prisma.ts

import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
	interface FastifyInstance {
		prisma: PrismaClient;
	}
}

export default fp(async (fastify: FastifyInstance) => {
	const prisma = new PrismaClient();

	try {
		await prisma.$connect();
		fastify.log.info("✅ Prisma connected to database");

		fastify.decorate("prisma", prisma);

		fastify.addHook("onClose", async (fastify) => {
			await fastify.prisma.$disconnect();
			fastify.log.info("❌ Prisma disconnected");
		});
	} catch (error) {
		fastify.log.error("❌ Error connecting to Prisma:", error);
		throw error;
	}
});
