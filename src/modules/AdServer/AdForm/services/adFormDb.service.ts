import type { FastifyInstance } from "fastify";

export async function createAdBid(
	fastify: FastifyInstance,
	data: {
		size: string;
		minCPM: number;
		maxCPM: number;
		geo: string;
		adType: string;
		frequency: number;
		creative: string;
	},
) {
	return fastify.prisma.adBid.create({
		data,
	});
}
