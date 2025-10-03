export const eventFiltersSchema = {
	type: "object",
	properties: {
		offset: { type: "integer", minimum: 0, default: 0 },
		limit: { type: "integer", minimum: 1, default: 10 },
		eventType: { type: "string", description: "Filter by event type" },
		dateFrom: {
			type: "string",
			format: "date",
			description: "Start date (YYYY-MM-DD)",
		},
		dateTo: {
			type: "string",
			format: "date",
			description: "End date (YYYY-MM-DD)",
		},
		hourFrom: {
			type: "integer",
			minimum: 0,
			maximum: 23,
			description: "Start hour",
		},
		hourTo: {
			type: "integer",
			minimum: 0,
			maximum: 23,
			description: "End hour",
		},
		adapter: {
			type: "string",
			description: "Filter by adapter if present in data",
		},
		creativeId: {
			type: "string",
			description: "Filter by creativeId if present in data",
		},
	},
	additionalProperties: false,
};
