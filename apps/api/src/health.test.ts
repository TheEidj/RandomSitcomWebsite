import Fastify from "fastify";

test("GET /health returns ok", async () => {
  const app = Fastify();
  app.get("/health", async () => ({ ok: true }));

  const res = await app.inject({ method: "GET", url: "/health" });

  expect(res.statusCode).toBe(200);
  expect(res.json()).toEqual({ ok: true });
});
