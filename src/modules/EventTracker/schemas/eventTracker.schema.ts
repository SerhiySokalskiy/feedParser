export const eventFiltersSchema = {
	type: "object",
	properties: {
		offset: { type: "integer", minimum: 0, default: 0 },
		limit: { type: "integer", minimum: 1, default: 10 },
		pageUrl: { type: "string", default: "all" },
		sessionId: { type: "string", default: "show" },
		userAgent: { type: "string", default: "show" },
		eventType: {
			type: "string",
			default: "all",
			description: "Filter by event type",
		},
		timestamp: { type: "string", default: "show" },
		data: { type: "string", default: "show" },
	},
	additionalProperties: false,
};
