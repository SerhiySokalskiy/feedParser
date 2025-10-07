export const registrationSchema = {
	body: {
		type: "object",
		properties: {
			name: { type: "string", minLength: 2, default: "Name" },
			email: { type: "string", format: "email", default: "example@gmail.com" },
			password: { type: "string", minLength: 6, default: "dasjhdsa73413" },
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
			email: {
				type: "string",
				format: "email",
				default: "sokalskiyserhiy1@gmail.com",
			},
			password: { type: "string", minLength: 6, default: "sokalskiy11" },
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
