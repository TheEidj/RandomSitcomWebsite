import jwt from "@fastify/jwt";
import type { FastifyPluginAsync } from "fastify";

export type JwtUser = { sub: string; role: "ADMIN" | "CUSTOMER" };

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: JwtUser;
  }
}

export const jwtPlugin: FastifyPluginAsync = async (app) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in environment");

  await app.register(jwt, { secret });
};
