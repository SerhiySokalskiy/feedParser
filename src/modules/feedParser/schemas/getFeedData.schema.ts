export const schema = {
	tags: ["feed"],
	summary: "Get feed data",
	description: "Get feed data",
	response: {
		200: {
			type: "object",
			properties: {
				hello: {
					type: "string",
				},
			},
		},
	},
} as const;
export const FeedQuerySchema = {
	type: "object",
	properties: {
		url: { type: "string", format: "uri" },
		force: { type: "string", enum: ["0", "1"] },
	},
	additionalProperties: false,
};
