import Fastify from "fastify";
import cors from "@fastify/cors";
import { jwtPlugin } from "./plugins/jwt.js";
import { authGuardsPlugin } from "./plugins/authGuards.js";
import { authRoutes } from "./routes/auth.js";
import { productsRoutes } from "./routes/products.js";
import { cartRoutes } from "./routes/cart.js";
import { ordersRoutes } from "./routes/orders.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(jwtPlugin);
  await app.register(authGuardsPlugin);

  app.get("/health", async () => ({ ok: true }));

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(productsRoutes, { prefix: "/api" });
  await app.register(cartRoutes, { prefix: "/api" });
  await app.register(ordersRoutes, { prefix: "/api" });

  return app;
}
