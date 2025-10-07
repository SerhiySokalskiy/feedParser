export const getAdBidFormSchema = {
	response: {
		200: {
			description: "HTML-форма для створення рекламного біда",
			type: "string",
		},
		500: {
			type: "object",
			properties: {
				message: { type: "string" },
			},
			required: ["message"],
		},
	},
};

export const createAdBidSchema = {
	body: {
		type: "object",
		properties: {
			size: { type: "string", default: "300x250" },
			minCPM: { type: "number", default: "100" },
			maxCPM: { type: "number", default: "150" },
			geo: { type: "string", default: "Ukr" },
			adType: { type: "string", default: "banner" },
			frequency: { type: "integer", default: 3 },
		},
		required: ["size", "minCPM", "maxCPM", "geo", "adType", "frequency"],
		additionalProperties: true,
	},
	response: {
		201: {
			type: "object",
			properties: {
				id: { type: "string" },
				size: { type: "string" },
				minCPM: { type: "number" },
				maxCPM: { type: "number" },
				geo: { type: "string" },
				adType: { type: "string" },
				frequency: { type: "integer" },
				creative: { type: "string" },
				createdAt: { type: "string", format: "date-time" },
			},
			required: [
				"id",
				"size",
				"minCPM",
				"maxCPM",
				"geo",
				"adType",
				"frequency",
				"creative",
				"createdAt",
			],
			additionalProperties: false,
		},
		500: {
			type: "object",
			properties: {
				message: { type: "string" },
			},
			required: ["message"],
			additionalProperties: false,
		},
	},
};
