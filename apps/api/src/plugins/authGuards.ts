import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

export const authGuardsPlugin: FastifyPluginAsync = async (app) => {
  app.decorate("requireAuth", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  });

  app.decorate("requireAdmin", async (req: FastifyRequest, reply: FastifyReply) => {
    await app.requireAuth(req, reply);
    if (reply.sent) return;

    if (req.user.role !== "ADMIN") {
      return reply.status(403).send({ error: "Forbidden" });
    }
  });
};

declare module "fastify" {
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
