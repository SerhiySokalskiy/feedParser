import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import type { LoginInput, RegistrationInput } from "../types/auth.types.js";

export async function registerUser(
	fastify: FastifyInstance,
	data: RegistrationInput,
) {
	const { name, email, password } = data;

	const existingUser = await fastify.prisma.user.findUnique({
		where: { email },
	});
	if (existingUser) {
		fastify.log.warn(`Registration failed, user exists: ${email}`);
		throw fastify.httpErrors.conflict("User with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await fastify.prisma.user.create({
		data: { name, email, password: hashedPassword },
	});

	fastify.log.info(`New user registered: ${email}`);
	return { id: user.id, name: user.name, email: user.email };
}

export async function loginUser(fastify: FastifyInstance, data: LoginInput) {
	const { email, password } = data;

	const user = await fastify.prisma.user.findUnique({ where: { email } });
	if (!user) {
		fastify.log.warn(`Login failed, user not found: ${email}`);
		throw fastify.httpErrors.unauthorized("Invalid email or password");
	}

	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid) {
		fastify.log.warn(`Login failed, wrong password: ${email}`);
		throw fastify.httpErrors.unauthorized("Invalid email or password");
	}

	const token = fastify.jwt.sign(
		{ userId: user.id, email: user.email },
		{ expiresIn: "24h" },
	);

	fastify.log.info(`User logged in: ${email}`);
	return {
		accessToken: token,
		user: { id: user.id, name: user.name, email: user.email },
	};
}
