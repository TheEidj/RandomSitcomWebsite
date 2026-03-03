import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@acme/db";
import type { Product } from "@acme/shared";

export const productsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/db/ping", async () => {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
    return { ok: true, db: result[0]?.ok === 1 };
  });

  app.get("/products", async () => {
    const rows = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

    const products = rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      images: p.images,
      price: { amount: p.priceCts, currency: p.currency },
      inStock: p.inStock,
    })) satisfies Array<Product & { slug: string; description: string | null; images: string[] }>;

    return { products };
  });

  app.get(
    "/products/:slug",
    {
      schema: {
        params: {
          type: "object",
          required: ["slug"],
          additionalProperties: false,
          properties: {
            slug: { type: "string", minLength: 3, maxLength: 120 },
          },
        },
      },
    },
    async (req, reply) => {
      const { slug } = req.params as { slug: string };

      const p = await prisma.product.findUnique({ where: { slug } });
      if (!p) return reply.status(404).send({ error: "Not Found" });

      return {
        product: {
          id: p.id,
          slug: p.slug,
          title: p.title,
          description: p.description,
          images: p.images,
          price: { amount: p.priceCts, currency: p.currency },
          inStock: p.inStock,
        },
      };
    },
  );

  app.post(
    "/products",
    {
      preHandler: app.requireAdmin,
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["slug", "title", "priceCts", "currency", "inStock"],
          properties: {
            slug: {
              type: "string",
              minLength: 3,
              maxLength: 120,
              pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            },
            title: { type: "string", minLength: 1, maxLength: 200 },
            description: { type: "string", nullable: true, maxLength: 4000 },
            images: {
              type: "array",
              items: { type: "string", minLength: 1 },
              maxItems: 20,
              default: [],
            },
            priceCts: { type: "integer", minimum: 0 },
            currency: { type: "string", enum: ["EUR", "USD"] },
            inStock: { type: "boolean" },
          },
        },
      },
    },
    async (req, reply) => {
      const body = req.body as {
        slug: string;
        title: string;
        description?: string | null;
        images?: string[];
        priceCts: number;
        currency: "EUR" | "USD";
        inStock: boolean;
      };

      const created = await prisma.product.create({
        data: {
          slug: body.slug,
          title: body.title,
          description: body.description ?? null,
          images: body.images ?? [],
          priceCts: body.priceCts,
          currency: body.currency,
          inStock: body.inStock,
        },
      });

      return reply.status(201).send({ product: created });
    },
  );
};
