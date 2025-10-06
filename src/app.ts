import path, { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import AutoLoad from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifyRedis from "@fastify/redis";
import fastifySchedule from "@fastify/schedule";
import fastifyStatic from "@fastify/static";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { metrics } from "@opentelemetry/api";
import Fastify, { type FastifyServerOptions } from "fastify";
import configPlugin from "./config/index.js";
import { getAdFormRoutes } from "./modules/AdServer/AdForm/routes/adForm.route.js";
import { getAdServerRoutes } from "./modules/AdServer/AdServerLogic/routes/adServer.route.js";
import { authRoutes } from "./modules/Auth/routes/auth.route.js";
import { eventTrackerRoutes } from "./modules/EventTracker/routes/eventTracker.route.js";
import { getFeedDataRoutes } from "./modules/feedParser/routes/feedParser.route.js";
import prismaPlugin from "./plugins/prisma.js";
import { createFeedJob } from "./tasks/UpdateFeedJob.js";

export type AppOptions = Partial<FastifyServerOptions>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildApp(options: AppOptions = {}) {
	//const { shutdown } = await initOpenTelemetry({ serviceName: "my-api-ts" });

	const meter = metrics.getMeter("demo-meter");
	const requestCounter = meter.createCounter("http_requests_total", {
		description: "Total HTTP requests",
	});
	requestCounter.add(1, { route: "/feed", method: "GET" });

	const fastify = Fastify({
		logger: true,
	}).withTypeProvider<TypeBoxTypeProvider>();

	await fastify.register(configPlugin);
	await fastify.register(prismaPlugin);
	await fastify.register(fastifySchedule);

	await fastify.register(fastifySwagger);

	await fastify.register(fastifySwaggerUi, {
		routePrefix: "/documentation",
		uiConfig: {
			docExpansion: "full",
			deepLinking: false,
		},
		uiHooks: {
			onRequest: (_request, _reply, next) => {
				next();
			},
			preHandler: (_request, _reply, next) => {
				next();
			},
		},
		staticCSP: true,
		transformStaticCSP: (header) => header,
		transformSpecification: (swaggerObject, _request, _reply) => {
			return swaggerObject;
		},
		transformSpecificationClone: true,
	});

	fastify.register(fastifyMultipart, {
		limits: {
			fileSize: 10 * 1024 * 1024,
		},
	});

	fastify.register(fastifyStatic, {
		root: path.join(process.cwd(), "public"),
		prefix: "/",
	});

	fastify.register(fastifyJwt, {
		secret: process.env.JWT_SECRET || "secret_fallback",
	});

	fastify.register(fastifyRedis, {
		host: "localhost",
		port: 6379,
	});

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

	fastify.ready().then(() => {
		const job = createFeedJob(fastify);
		fastify.scheduler.addCronJob(job);
		fastify.log.info("✅ Feed updater job scheduled (every hour)");
	});

	fastify.get("/", async () => {
		return { hello: "world" };
	});

	await fastify.register(fastifyCors, {
		origin: [fastify.config.CLIENT_URL],
		credentials: true,
		methods: ["GET", "POST", "OPTIONS"],
	});

	fastify.register(getFeedDataRoutes);
	fastify.register(authRoutes);
	fastify.register(getAdServerRoutes);
	fastify.register(getAdFormRoutes);
	fastify.register(eventTrackerRoutes);

	//fastify.addHook("onClose", async () => {
	//	await shutdown("fastify onClose");
	//});

	return fastify;
}

export default buildApp;
