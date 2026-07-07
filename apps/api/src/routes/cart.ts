import type { FastifyPluginAsync } from "fastify";
import "../plugins/jwt.js";
import { prisma } from "@acme/db";

export const cartRoutes: FastifyPluginAsync = async (app) => {
  app.get("/cart", { preHandler: app.requireAuth }, async (req) => {
    const userId = req.user.sub;

    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return {
      cart: {
        items: cart.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          product: {
            id: it.product.id,
            slug: it.product.slug,
            title: it.product.title,
            priceCts: it.product.priceCts,
            currency: it.product.currency,
            inStock: it.product.inStock,
          },
        })),
      },
    };
  });

  app.post(
    "/cart/merge",
    {
      preHandler: app.requireAuth,
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["items"],
          properties: {
            items: {
              type: "array",
              maxItems: 200,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["productId", "quantity"],
                properties: {
                  productId: { type: "string", minLength: 1 },
                  quantity: { type: "integer", minimum: 0, maximum: 99 },
                },
              },
            },
          },
        },
      },
    },
    async (req) => {
      const userId = req.user.sub;
      const body = req.body as { items: Array<{ productId: string; quantity: number }> };

      const cart = await prisma.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      // Merge: sum quantities, clamp to 99
      await prisma.$transaction(async (tx) => {
        for (const item of body.items) {
          if (item.quantity <= 0) continue;

          const existing = await tx.cartItem.findUnique({
            where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
          });

          const nextQty = Math.min(99, (existing?.quantity ?? 0) + item.quantity);

          await tx.cartItem.upsert({
            where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
            create: { cartId: cart.id, productId: item.productId, quantity: nextQty },
            update: { quantity: nextQty },
          });
        }
      });

      const hydrated = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true }, orderBy: { createdAt: "asc" } } },
      });

      return {
        cart: {
          items: (hydrated?.items ?? []).map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            product: {
              id: it.product.id,
              slug: it.product.slug,
              title: it.product.title,
              priceCts: it.product.priceCts,
              currency: it.product.currency,
              inStock: it.product.inStock,
            },
          })),
        },
      };
    },
  );

  app.post(
    "/cart/items",
    {
      preHandler: app.requireAuth,
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["productId", "quantity"],
          properties: {
            productId: { type: "string", minLength: 1 },
            quantity: { type: "integer", minimum: 0, maximum: 99 },
          },
        },
      },
    },
    async (req, reply) => {
      const userId = req.user.sub;
      const body = req.body as { productId: string; quantity: number };

      const product = await prisma.product.findUnique({ where: { id: body.productId } });
      if (!product) return reply.status(404).send({ error: "Product not found" });

      const cart = await prisma.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      if (body.quantity === 0) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id, productId: body.productId },
        });
      } else {
        await prisma.cartItem.upsert({
          where: { cartId_productId: { cartId: cart.id, productId: body.productId } },
          create: { cartId: cart.id, productId: body.productId, quantity: body.quantity },
          update: { quantity: body.quantity },
        });
      }

      return reply.status(204).send();
    },
  );

  app.delete(
    "/cart/items/:productId",
    {
      preHandler: app.requireAuth,
      schema: {
        params: {
          type: "object",
          additionalProperties: false,
          required: ["productId"],
          properties: {
            productId: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (req, reply) => {
      const userId = req.user.sub;
      const { productId } = req.params as { productId: string };

      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (!cart) return reply.status(204).send();

      await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
      return reply.status(204).send();
    },
  );
};
