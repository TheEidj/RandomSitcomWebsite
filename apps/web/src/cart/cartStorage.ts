export type GuestCartItem = { productId: string; quantity: number };
export type GuestCart = { items: GuestCartItem[] };

const KEY = "guest_cart_v1";

export function loadGuestCart(): GuestCart {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as GuestCart;
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

export function saveGuestCart(cart: GuestCart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function clearGuestCart() {
  localStorage.removeItem(KEY);
}

export function addGuestCartItem(productId: string, delta: number) {
  const cart = loadGuestCart();
  const existing = cart.items.find((i) => i.productId === productId);
  if (!existing) {
    cart.items.push({ productId, quantity: Math.min(99, Math.max(1, delta)) });
  } else {
    existing.quantity = Math.min(99, Math.max(0, existing.quantity + delta));
    if (existing.quantity === 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    }
  }
  saveGuestCart(cart);
  return cart;
}

export function guestCartCount(cart: GuestCart) {
  return cart.items.reduce((sum, it) => sum + it.quantity, 0);
}
