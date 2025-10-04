import type { NodeSDK } from "@opentelemetry/sdk-node";

export function registerOtelShutdownHook(
	sdk: NodeSDK,
): (reason?: string) => Promise<void> {
	let shuttingDown = false;

	const shutdown = async (reason = "signal"): Promise<void> => {
		if (shuttingDown) return;
		shuttingDown = true;
		console.log(`[otel] shutting down sdk due to ${reason}…`);
		try {
			await sdk.shutdown();
			console.log("[otel] sdk shutdown complete");
		} catch (err) {
			console.error("[otel] sdk shutdown error", err);
		}
	};

	process.on("SIGINT", () => void shutdown("SIGINT"));
	process.on("SIGTERM", () => void shutdown("SIGTERM"));
	process.on("uncaughtException", async (err) => {
		console.error("uncaughtException —", err);
		await shutdown("uncaughtException");
		process.exit(1);
	});

	return shutdown;
}
