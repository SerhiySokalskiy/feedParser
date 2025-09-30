export const getBidsSchema = {
	description: "Фільтрація бід за параметрами",
	tags: ["AdServer"],
	body: {
		type: "object",
		properties: {
			size: { type: "string" },
			cpm: { type: "number" },
			geo: { type: "string" },
			adType: { type: "string" },
		},
		required: ["size", "cpm", "geo", "adType"],
	},
};
