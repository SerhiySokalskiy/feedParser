import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { loginSchema, registrationSchema } from "../schemas/auth.schema.js";
import { loginUser, registerUser } from "../services/auth.service.js";
import type { LoginInput, RegistrationInput } from "../types/auth.types.js";

export async function authRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/auth/registration",
		{ schema: registrationSchema },
		async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				const user = await registerUser(
					fastify,
					request.body as RegistrationInput,
				);
				return reply.status(201).send(user);
			} catch (error) {
				fastify.log.error("Registration error:", error);
				throw error;
			}
		},
	);

	fastify.post(
		"/auth/login",
		{ schema: loginSchema },
		async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				const result = await loginUser(fastify, request.body as LoginInput);
				return reply.status(200).send(result);
			} catch (error) {
				fastify.log.error("Login error:", error);
				throw error;
			}
		},
	);
}
