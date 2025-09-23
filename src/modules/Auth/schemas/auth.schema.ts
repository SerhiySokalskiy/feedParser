export const registrationSchema = {
	body: {
		type: "object",
		properties: {
			name: { type: "string", minLength: 2 },
			email: { type: "string", format: "email" },
			password: { type: "string", minLength: 6 },
		},
		required: ["name", "email", "password"],
		additionalProperties: false,
	},
	response: {
		201: {
			type: "object",
			properties: {
				id: { type: "string" },
				name: { type: "string" },
				email: { type: "string" },
			},
			required: ["id", "name", "email"],
		},
	},
};

export const loginSchema = {
	body: {
		type: "object",
		properties: {
			email: { type: "string", format: "email" },
			password: { type: "string", minLength: 6 },
		},
		required: ["email", "password"],
		additionalProperties: false,
	},
	response: {
		200: {
			type: "object",
			properties: {
				accessToken: { type: "string" },
				user: {
					type: "object",
					properties: {
						id: { type: "string" },
						name: { type: "string" },
						email: { type: "string" },
					},
					required: ["id", "name", "email"],
				},
			},
			required: ["accessToken"],
		},
	},
};
