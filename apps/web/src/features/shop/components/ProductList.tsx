import type { ShopProductVM } from "../types";

export function ProductList({
  products,
  onAddToCart,
  addingProductId,
}: {
  products: ShopProductVM[];
  onAddToCart: (productId: string) => void;
  addingProductId: string | null;
}) {
  if (products.length === 0) return <p>No products yet.</p>;

  return (
    <ul className="space-y-3">
      {products.map((p) => (
        <li
          key={p.id}
          className="flex items-start justify-between gap-4 rounded border border-zinc-200 p-4"
        >
          <div>
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-zinc-600">{p.priceLabel}</div>
            <div className="text-xs">{p.inStock ? "In stock" : "Out of stock"}</div>
          </div>

          <button
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
            disabled={!p.inStock || addingProductId === p.id}
            onClick={() => onAddToCart(p.id)}
            type="button"
          >
            {addingProductId === p.id ? "Adding…" : "Add to cart"}
          </button>
        </li>
      ))}
    </ul>
  );
}
