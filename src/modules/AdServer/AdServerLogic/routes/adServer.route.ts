import type { FastifyInstance, FastifyRequest } from "fastify";
import { getBidsSchema } from "../schemas/adServer.schema.js";
import { getFilteredBids } from "../services/adServer.service.js";

type GetBidsBody = {
	size: string;
	cpm: number;
	geo: string;
	adType: string;
};

export async function getAdServerRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/wonBids",
		{
			schema: getBidsSchema,
		},
		async (requset: FastifyRequest<{ Body: GetBidsBody }>, reply) => {
			try {
				const bids = await getFilteredBids(fastify, requset.body, requset.ip);

				if (!bids.length) {
					return reply.notFound("Підходящих бід не знайдено");
				}

				return bids;
			} catch (error) {
				fastify.log.error(error);
				return reply.internalServerError("Не вдалося отримати біди");
			}
		},
	);
}
