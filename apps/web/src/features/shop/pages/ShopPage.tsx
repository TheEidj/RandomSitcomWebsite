import { useEffect, useMemo, useState } from "react";
import type { Product } from "@acme/shared";
import { getProducts } from "../../../api/products";
import { ProductList } from "../components/ProductList";
import type { ShopProductVM } from "../types";

function formatMoney(product: Product) {
  const amount = product.price.amount / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: product.price.currency,
  }).format(amount);
}

export function ShopPage() {
  const [data, setData] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getProducts()
      .then((res) => {
        if (!cancelled) setData(res.products);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const productsVm: ShopProductVM[] = useMemo(() => {
    if (!data) return [];
    return data.map((p) => ({
      id: p.id,
      title: p.title,
      priceLabel: formatMoney(p),
      inStock: p.inStock,
    }));
  }, [data]);

  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
  if (!data) return <p className="p-4 text-zinc-600">Loading products…</p>;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-4xl font-bold tracking-tight">Shop</h1>
      <div className="mt-6">
        <ProductList products={productsVm} />
      </div>
    </main>
  );
}
