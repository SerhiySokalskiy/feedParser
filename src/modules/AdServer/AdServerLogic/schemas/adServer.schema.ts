export const getBidsSchema = {
	description: "Фільтрація бід за параметрами",
	tags: ["AdServer"],
	body: {
		type: "object",
		properties: {
			size: { type: "string", default: "300x250" },
			cpm: { type: "number", default: 110 },
			geo: { type: "string", default: "Ukr" },
			adType: { type: "string", default: "banner" },
		},
		required: ["size", "cpm", "geo", "adType"],
	},
};
