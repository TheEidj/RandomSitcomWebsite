import type { FastifyPluginAsync } from "fastify";
import argon2 from "argon2";
import { prisma } from "@acme/db";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

export const authRoutes: FastifyPluginAsync = async (app) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  app.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["email", "password"],
          properties: {
            email: { type: "string", minLength: 3, maxLength: 320 },
            password: { type: "string", minLength: 1, maxLength: 2000 },
          },
        },
      },
    },
    async (req, reply) => {
      const body = req.body as { email: string; password: string };

      const user = await prisma.user.findUnique({ where: { email: body.email } });
      if (!user) return reply.status(401).send({ error: "Invalid credentials" });

      const ok = await argon2.verify(user.passwordHash, body.password);
      if (!ok) return reply.status(401).send({ error: "Invalid credentials" });

      // Check if email is verified
      if (!user.emailVerified) {
        return reply.status(403).send({ error: "Please verify your email before logging in" });
      }

      const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "2h" });

      return { token };
    },
  );

  app.get("/me", { preHandler: app.requireAuth }, async (req) => {
    return { user: { id: req.user.sub, role: req.user.role } };
  });

  app.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["email", "password"],
          properties: {
            email: { type: "string", minLength: 3, maxLength: 320 },
            password: { type: "string", minLength: 8, maxLength: 2000 },
          },
        },
      },
    },
    async (req, reply) => {
      const body = req.body as { email: string; password: string };

      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing) {
        return reply.status(409).send({ error: "Email already registered" });
      }

      const passwordHash = await argon2.hash(body.password);
      const verifyToken = randomBytes(32).toString("hex");
      const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      app.log.info(`Creating user with email: ${body.email}, verifyToken: ${verifyToken}`);

      const createdUser = await prisma.user.create({
        data: {
          email: body.email,
          passwordHash,
          verifyToken,
          verifyTokenExp,
        },
      });

      app.log.info(
        `User created with id: ${createdUser.id}, verifyToken in DB: ${createdUser.verifyToken}`,
      );

      // In production: send email with verification link
      // For now: log to console
      const redirect = (body as { redirect?: string }).redirect;
      const verifyUrl = `${process.env.WEB_URL || "http://localhost:5174"}/verify-email?token=${verifyToken}${redirect ? `&redirect=${redirect}` : ""}`;
      console.log(`\n🔗 Email verification link: ${verifyUrl}\n`);

      return { message: "Registration successful. Please check your email." };
    },
  );

  app.get(
    "/verify-email",
    {
      schema: {
        querystring: {
          type: "object",
          required: ["token"],
          properties: {
            token: { type: "string" },
          },
        },
      },
    },
    async (req, reply) => {
      const { token } = req.query as { token: string };

      app.log.info(`Verifying email with token: ${token}`);

      const user = await prisma.user.findUnique({ where: { verifyToken: token } });

      if (!user) {
        app.log.warn(`No user found with verification token: ${token}`);
        return reply.status(400).send({ error: "Invalid verification token" });
      }

      app.log.info(`User found: ${user.email}, emailVerified: ${user.emailVerified}`);

      // If already verified, consider it a success (handle double calls)
      if (user.emailVerified) {
        app.log.info(`Email already verified for user: ${user.email}`);
        return { message: "Email verified successfully!" };
      }

      if (!user.verifyTokenExp || user.verifyTokenExp < new Date()) {
        return reply.status(400).send({ error: "Verification token expired" });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, verifyToken: null, verifyTokenExp: null },
      });

      return { message: "Email verified successfully!" };
    },
  );
};
