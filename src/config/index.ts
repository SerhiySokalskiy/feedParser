import fastifyEnv from "@fastify/env";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { EnvSchema } from "./schema.js";

export default fp(
	async (fastify: FastifyInstance) => {
		try {
			await fastify.register(fastifyEnv, {
				confKey: "config",
				schema: EnvSchema,
				dotenv: true,
				data: process.env,
				ajv: {
					customOptions: () => {
						const ajv = new Ajv.default({
							// якщо TS все ще скаржиться, пробуй Ajv.default
							allErrors: true,
							removeAdditional: "all",
							coerceTypes: true,
							useDefaults: true,
						});
						addFormats.default(ajv);
						return ajv;
					},
				},
			});

			fastify.log.info("✅ Environment variables loaded successfully");
		} catch (error) {
			fastify.log.error("❌ Error in config plugin:", error);
			throw error;
		}
	},
	{
		name: "config-plugin",
	},
);
