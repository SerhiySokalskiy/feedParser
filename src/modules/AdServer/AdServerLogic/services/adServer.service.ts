import type { FastifyInstance } from "fastify";
import type { AdBid } from "../../../../../prisma/generated/prisma/index.js";

export async function getFilteredBids(
	fastify: FastifyInstance,
	filters: {
		size?: string;
		cpm?: number;
		geo?: string;
		adType?: string;
	},
	userIp: string,
) {
	const allBids = await fastify.prisma.adBid.findMany({
		where: {
			...(filters.size ? { size: filters.size } : {}),
			...(filters.geo ? { geo: filters.geo } : {}),
			...(filters.adType ? { adType: filters.adType } : {}),
			...(filters.cpm
				? {
						AND: [
							{ minCPM: { lte: filters.cpm } },
							{ maxCPM: { gte: filters.cpm } },
						],
					}
				: {}),
		},
		orderBy: {
			maxCPM: "desc",
		},
	});

	const filtered: AdBid[] = [];

	for (const bid of allBids) {
		const key = `adfreq:${userIp}:${bid.id}`;
		const count = await fastify.redis.incr(key);

		if ((count - 1) % bid.frequency === 0) {
			filtered.push(bid);
		}
	}

	return filtered;
}
