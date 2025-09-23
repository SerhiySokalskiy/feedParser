export const getFeedSchema = {
	querystring: {
		type: "object",
		properties: {
			url: { type: "string", format: "uri" },
			force: { type: "string", enum: ["0", "1"] },
		},
		additionalProperties: false,
	},
};

export const getArticleByIdSchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "string" },
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
