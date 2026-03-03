export type CreateProductInput = {
  slug: string;
  title: string;
  description?: string | null;
  images?: string[];
  priceCts: number;
  currency: "EUR" | "USD";
  inStock: boolean;
};

export async function createProduct(token: string, input: CreateProductInput) {
  const base = (import.meta.env.VITE_API_URL as string).replace(/\/$/, "");
  const res = await fetch(`${base}/api/products`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Create product failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  return (await res.json()) as { product: unknown };
}
