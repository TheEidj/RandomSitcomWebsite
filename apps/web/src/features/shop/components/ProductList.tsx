import type { ShopProductVM } from "../types";

export function ProductList({ products }: { products: ShopProductVM[] }) {
  if (products.length === 0) return <p>No products yet.</p>;

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id} style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600 }}>{p.title}</div>
          <div>{p.priceLabel}</div>
          <div>{p.inStock ? "In stock" : "Out of stock"}</div>
        </li>
      ))}
    </ul>
  );
}
