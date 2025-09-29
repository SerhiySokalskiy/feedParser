import { createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import type { FastifyInstance } from "fastify";
import { getAdBidFormSchema } from "../schemas/adForms.schema.js";
import { createAdBid } from "../services/adFormDb.service.js";
import type { AdBidField, AdBidFields } from "../types/adForm.types.js";

const pump = promisify(pipeline);

export async function getAdFormRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/form",
		{
			schema: getAdBidFormSchema,
		},
		async (_requset, reply) => {
			return reply.sendFile("adForm.html");
		},
	);

	fastify.post("/api/ad-bids", async (request, reply) => {
		const parts = request.parts();
		const fields: Partial<AdBidFields> = {};
		let filePart: AdBidField | undefined;

		for await (const part of parts) {
			if (part.type === "file") {
				filePart = {
					...part,
					type: "file",
					filename: part.filename,
					file: part.file,
				};
				fields.creative = filePart;
			} else if (part.type === "field") {
				fields[part.fieldname as keyof AdBidFields] = part as AdBidField;
			}
		}

		if (!fields.creative || !fields.size || !fields.minCPM) {
			return reply.status(400).send({ message: "Missing required fields" });
		}

		const uniqueFilename = `${Date.now()}_${fields.creative.filename}`;
		const filePath = path.join(process.cwd(), "public", uniqueFilename);

		if (fields.creative.file) {
			await pump(fields.creative.file, createWriteStream(filePath));
		}

		if (
			!fields.size?.value ||
			!fields.minCPM?.value ||
			!fields.maxCPM?.value ||
			!fields.geo?.value ||
			!fields.adType?.value ||
			!fields.frequency?.value ||
			!fields.creative?.filename
		) {
			return reply.status(400).send({ message: "Missing required fields" });
		}

		const adBidData = {
			size: fields.size.value ?? "",
			minCPM: parseFloat(fields.minCPM.value ?? "0"),
			maxCPM: parseFloat(fields.maxCPM.value ?? "0"),
			geo: fields.geo.value ?? "",
			adType: fields.adType.value ?? "",
			frequency: parseInt(fields.frequency.value ?? "0", 10),
			creative: uniqueFilename,
		};

		const created = await createAdBid(fastify, adBidData);

		return reply.status(201).send(created);
	});
}
