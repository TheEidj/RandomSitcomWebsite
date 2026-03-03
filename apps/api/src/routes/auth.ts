import type { FastifyPluginAsync } from "fastify";
import argon2 from "argon2";
import { prisma } from "@acme/db";

export const authRoutes: FastifyPluginAsync = async (app) => {
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

      const token = await reply.jwtSign(
        { role: user.role },
        { sign: { sub: user.id, expiresIn: "2h" } },
      );

      return { token };
    },
  );

  app.get("/me", { preHandler: app.requireAuth }, async (req) => {
    return { user: { id: req.user.sub, role: req.user.role } };
  });
};
