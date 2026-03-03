export async function seedProducts(prisma) {
  const products = [
    {
      slug: "tshirt-tour-2026",
      title: "T-Shirt Tour 2026",
      description: "T-shirt officiel de la tournée 2026.",
      images: [],
      priceCts: 2500,
      currency: "EUR",
      inStock: true,
    },
    {
      slug: "hoodie-logo-noir",
      title: "Hoodie Logo (Noir)",
      description: "Hoodie premium avec logo brodé.",
      images: [],
      priceCts: 5500,
      currency: "EUR",
      inStock: true,
    },
    {
      slug: "vinyle-album-limite",
      title: "Vinyle Album (Édition limitée)",
      description: "Pressage limité, packaging collector.",
      images: [],
      priceCts: 3200,
      currency: "EUR",
      inStock: false,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: p,
      update: {
        title: p.title,
        description: p.description,
        images: p.images,
        priceCts: p.priceCts,
        currency: p.currency,
        inStock: p.inStock,
      },
    });
  }
}
