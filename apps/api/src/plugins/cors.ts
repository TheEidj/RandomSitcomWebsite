import cors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";

export const corsPlugin: FastifyPluginAsync = async (app) => {
  await app.register(cors, {
    origin: ["http://localhost:5173"],
    credentials: true,
  });
};
