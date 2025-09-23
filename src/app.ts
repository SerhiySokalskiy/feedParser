import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import AutoLoad from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify, { type FastifyServerOptions } from "fastify";
import configPlugin from "./config/index.js";
import { authRoutes } from "./modules/Auth/routes/auth.route.js";
import { getFeedDataRoutes } from "./modules/feedParser/routes/feedParser.route.js";
import prismaPlugin from "./plugins/prisma.js";

export type AppOptions = Partial<FastifyServerOptions>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildApp(options: AppOptions = {}) {
	const fastify = Fastify({
		logger: true,
	}).withTypeProvider<TypeBoxTypeProvider>();
	await fastify.register(configPlugin);
	await fastify.register(prismaPlugin);

	try {
		fastify.decorate("pluginLoaded", (pluginName: string) => {
			fastify.log.info(`✅ Plugin loaded: ${pluginName}`);
		});

		fastify.log.info("Starting to load plugins");
		await fastify.register(AutoLoad, {
			dir: join(__dirname, "plugins"),
			options: options,
			ignorePattern: /^((?!plugin).)*$/,
		});

		fastify.log.info("✅ Plugins loaded successfully");
	} catch (error) {
		fastify.log.error("Error in autoload:", error);
		throw error;
	}

	await fastify.register(AutoLoad, {
		dir: join(__dirname, "modules"),
		options: { prefix: "/" },
	});

	fastify.get("/", async () => {
		return { hello: "world" };
	});

	await fastify.register(fastifyCors, {
		origin: "*",
	});

	fastify.register(getFeedDataRoutes);
	fastify.register(authRoutes);

	return fastify;
}

export default buildApp;
