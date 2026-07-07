import { default as fastifyJwt } from "@fastify/jwt";
import type { FastifyPluginAsync } from "fastify";

export type JwtUser = { sub: string; role: "ADMIN" | "CUSTOMER" };

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtUser;
    user: JwtUser;
  }
}

declare module "fastify" {
  interface FastifyRequest {
    jwtVerify(): Promise<void>;
    user: JwtUser;
  }
}

export const jwtPlugin: FastifyPluginAsync = async (app) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in environment");

  await app.register(fastifyJwt, { secret });
};
