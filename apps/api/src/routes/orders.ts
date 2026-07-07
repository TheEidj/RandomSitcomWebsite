import type { FastifyPluginAsync } from "fastify";
import "../plugins/jwt.js";
import { prisma } from "@acme/db";

export const ordersRoutes: FastifyPluginAsync = async (app) => {
  // Guest checkout - create order without authentication
  app.post(
    "/orders/guest",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["email", "items", "shipping"],
          properties: {
            email: { type: "string", format: "email" },
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "integer", minimum: 1, maximum: 99 },
                },
              },
            },
            shipping: {
              type: "object",
              required: ["fullName", "address", "city", "postalCode", "country"],
              properties: {
                fullName: { type: "string", minLength: 1 },
                address: { type: "string", minLength: 1 },
                city: { type: "string", minLength: 1 },
                postalCode: { type: "string", minLength: 1 },
                country: { type: "string", minLength: 1 },
                phone: { type: "string" },
              },
            },
            billing: {
              type: "object",
              properties: {
                fullName: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                postalCode: { type: "string" },
                country: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const body = req.body as {
        email: string;
        items: Array<{ productId: string; quantity: number }>;
        shipping: {
          fullName: string;
          address: string;
          city: string;
          postalCode: string;
          country: string;
          phone?: string;
        };
        billing?: {
          fullName: string;
          address: string;
          city: string;
          postalCode: string;
          country: string;
        };
      };

      // Fetch products to validate and get prices
      const productIds = body.items.map((item) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        return reply.status(400).send({ error: "Some products not found" });
      }

      // Check stock and currency consistency
      const currency = products[0]!.currency;
      for (const product of products) {
        if (!product.inStock) {
          return reply.status(400).send({ error: `Out of stock: ${product.slug}` });
        }
        if (product.currency !== currency) {
          return reply.status(400).send({ error: "Mixed currencies not supported" });
        }
      }

      // Calculate total
      let totalCts = 0;
      const orderItems = body.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        totalCts += product.priceCts * item.quantity;
        return {
          productId: product.id,
          title: product.title,
          slug: product.slug,
          unitPriceCts: product.priceCts,
          quantity: item.quantity,
        };
      });

      // Create/reuse guest user
      const guestUser = await prisma.user.upsert({
        where: { email: body.email },
        create: {
          email: body.email,
          passwordHash: "", // No password for guest
          role: "CUSTOMER",
          emailVerified: true, // Guest checkout doesn't need verification
        },
        update: {},
      });

      const order = await prisma.order.create({
        data: {
          userId: guestUser.id,
          currency,
          totalCts,
          shippingEmail: body.email,
          shippingFullName: body.shipping.fullName,
          shippingAddress: body.shipping.address,
          shippingCity: body.shipping.city,
          shippingPostalCode: body.shipping.postalCode,
          shippingCountry: body.shipping.country,
          shippingPhone: body.shipping.phone || null,
          billingFullName: body.billing?.fullName || null,
          billingAddress: body.billing?.address || null,
          billingCity: body.billing?.city || null,
          billingPostalCode: body.billing?.postalCode || null,
          billingCountry: body.billing?.country || null,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      app.log.info(`Guest order created: ${order.id} for ${body.email}`);

      return reply.status(201).send({ order });
    },
  );

  app.post(
    "/orders",
    {
      preHandler: app.requireAuth,
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["shipping"],
          properties: {
            shipping: {
              type: "object",
              required: ["fullName", "address", "city", "postalCode", "country"],
              properties: {
                fullName: { type: "string", minLength: 1 },
                address: { type: "string", minLength: 1 },
                city: { type: "string", minLength: 1 },
                postalCode: { type: "string", minLength: 1 },
                country: { type: "string", minLength: 1 },
                phone: { type: "string" },
              },
            },
            billing: {
              type: "object",
              properties: {
                fullName: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                postalCode: { type: "string" },
                country: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const userId = req.user.sub;
      const body = req.body as {
        shipping: {
          fullName: string;
          address: string;
          city: string;
          postalCode: string;
          country: string;
          phone?: string;
        };
        billing?: {
          fullName: string;
          address: string;
          city: string;
          postalCode: string;
          country: string;
        };
      };

      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        return reply.status(400).send({ error: "Cart is empty" });
      }

      // Get user for email
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      // Simple rule: single currency cart (typique)
      const currency = cart.items[0]!.product.currency;
      for (const it of cart.items) {
        if (it.product.currency !== currency) {
          return reply.status(400).send({ error: "Mixed currencies not supported" });
        }
        if (!it.product.inStock) {
          return reply.status(400).send({ error: `Out of stock: ${it.product.slug}` });
        }
      }

      const totalCts = cart.items.reduce((sum, it) => sum + it.product.priceCts * it.quantity, 0);

      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            userId,
            currency,
            totalCts,
            shippingEmail: user.email,
            shippingFullName: body.shipping.fullName,
            shippingAddress: body.shipping.address,
            shippingCity: body.shipping.city,
            shippingPostalCode: body.shipping.postalCode,
            shippingCountry: body.shipping.country,
            shippingPhone: body.shipping.phone || null,
            billingFullName: body.billing?.fullName || null,
            billingAddress: body.billing?.address || null,
            billingCity: body.billing?.city || null,
            billingPostalCode: body.billing?.postalCode || null,
            billingCountry: body.billing?.country || null,
            items: {
              create: cart.items.map((it) => ({
                productId: it.productId,
                title: it.product.title,
                slug: it.product.slug,
                unitPriceCts: it.product.priceCts,
                quantity: it.quantity,
              })),
            },
          },
          include: { items: true },
        });

        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return created;
      });

      return reply.status(201).send({ order });
    },
  );

  app.get("/orders/me", { preHandler: app.requireAuth }, async (req) => {
    const userId = req.user.sub;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return { orders };
  });
};
