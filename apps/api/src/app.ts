import Fastify from "fastify";
import { corsPlugin } from "./plugins/cors.js";
import { jwtPlugin } from "./plugins/jwt.js";
import { authGuardsPlugin } from "./plugins/authGuards.js";
import { authRoutes } from "./routes/auth.js";
import { productsRoutes } from "./routes/products.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(corsPlugin);
  await app.register(jwtPlugin);
  await app.register(authGuardsPlugin);

  app.get("/health", async () => ({ ok: true }));

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(productsRoutes, { prefix: "/api" });

  return app;
}
