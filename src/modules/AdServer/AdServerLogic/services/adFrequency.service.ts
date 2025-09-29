import type { FastifyInstance } from "fastify";

export async function shouldShowAd(
	fastify: FastifyInstance,
	userId: string,
	adId: string,
	frequency: number,
): Promise<boolean> {
	const key = `adfreq:${userId}:${adId}`;
	const count = await fastify.redis.incr(key);

	return (count - 1) % frequency === 0;
}
