import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../../api/products";
import type { ApiProduct } from "../../../api/products";
import { ProductList } from "../components/ProductList";
import type { ShopProductVM } from "../types";
import { addGuestCartItem } from "../../../cart/cartStorage";
import { emitCartChanged } from "../../../cart/useCartCount";
import { useAuth } from "../../../auth/useAuth";
import { getCart, setCartItemQuantity } from "../../../api/cart";

function formatMoney(product: ApiProduct) {
  const amount = product.price.amount / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: product.price.currency,
  }).format(amount);
}

export function ShopPage() {
  const { token } = useAuth();

  const [data, setData] = useState<ApiProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

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
      slug: p.slug,
      title: p.title,
      priceLabel: formatMoney(p),
      inStock: p.inStock,
    }));
  }, [data]);

  async function addToCart(productId: string) {
    setAdding(productId);
    try {
      if (!token) {
        addGuestCartItem(productId, 1);
        emitCartChanged();
        return;
      }

      const cart = await getCart(token);
      const current = cart.cart.items.find((it) => it.productId === productId)?.quantity ?? 0;
      await setCartItemQuantity(token, productId, Math.min(99, current + 1));
      emitCartChanged();
    } finally {
      setAdding(null);
    }
  }

  if (error) return <p className="p-4 text-red-600">Error: {error}</p>;
  if (!data) return <p className="p-4 text-zinc-600">Loading products…</p>;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-4xl font-bold tracking-tight">Shop</h1>

      <div className="mt-6">
        <ProductList
          products={productsVm}
          onAddToCart={(id) => void addToCart(id)}
          addingProductId={adding}
        />
      </div>

      <div className="mt-6 text-sm text-zinc-500">
        <Link className="underline" to="/cart">
          Go to cart
        </Link>
      </div>
    </main>
  );
}
