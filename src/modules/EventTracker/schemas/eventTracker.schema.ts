export const eventFiltersSchema = {
	type: "object",
	properties: {
		offset: { type: "integer", minimum: 0, default: 0 },
		limit: { type: "integer", minimum: 1, default: 10 },
		pageUrl: { type: "string" },
		sessionId: { type: "string" },
		userAgent: { type: "string" },
		eventType: { type: "string", description: "Filter by event type" },
		timestamp: { type: "string" },
		data: { type: "string" },
	},
	additionalProperties: false,
};
