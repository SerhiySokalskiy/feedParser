export const getFeedSchema = {
	querystring: {
		type: "object",
		properties: {
			url: {
				type: "string",
				format: "uri",
				default: "https://rss.unian.net/site/news_ukr.rss",
			},
			force: { type: "string", enum: ["0", "1"], default: "0" },
		},
		additionalProperties: false,
	},
};

export const getArticleByIdSchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "string", default: "68e53181739d6a3dc0f1dfd8" },
		},
		required: ["id"],
		additionalProperties: false,
	},
	response: {
		200: {
			type: "object",
			properties: {
				title: { type: "string" },
				text: {
					type: "array",
					items: { type: "string" },
				},
				image: { type: "string", nullable: true },
			},
			required: ["title", "text"],
		},
		404: {
			type: "object",
			properties: {
				message: { type: "string" },
			},
			required: ["message"],
		},
	},
};
