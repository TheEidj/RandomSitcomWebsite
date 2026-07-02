import type { GuestCartItem } from "../cart/cartStorage";

export type CartResponse = {
  cart: {
    items: Array<{
      productId: string;
      quantity: number;
      product: {
        id: string;
        slug: string;
        title: string;
        priceCts: number;
        currency: "EUR" | "USD";
        inStock: boolean;
      };
    }>;
  };
};

function apiBase() {
  return (import.meta.env.VITE_API_URL as string).replace(/\/$/, "");
}

export async function mergeCart(token: string, items: GuestCartItem[]) {
  const res = await fetch(`${apiBase()}/api/cart/merge`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Merge cart failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  return (await res.json()) as CartResponse;
}

export async function getCart(token: string) {
  const res = await fetch(`${apiBase()}/api/cart`, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Get cart failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }

  return (await res.json()) as CartResponse;
}

export async function setCartItemQuantity(token: string, productId: string, quantity: number) {
  const res = await fetch(`${apiBase()}/api/cart/items`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Set cart item failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }
}
