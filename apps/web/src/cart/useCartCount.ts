import { useEffect, useState } from "react";
import { getCart } from "../api/cart";
import { guestCartCount, loadGuestCart } from "./cartStorage";
import { useAuth } from "../auth/useAuth";

const EVENT = "cart:changed";

export function emitCartChanged() {
  window.dispatchEvent(new Event(EVENT));
}

export function useCartCount() {
  const { token } = useAuth();
  const [count, setCount] = useState<number>(() => guestCartCount(loadGuestCart()));

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      if (!token) {
        if (!cancelled) setCount(guestCartCount(loadGuestCart()));
        return;
      }

      try {
        const res = await getCart(token);
        const next = res.cart.items.reduce((sum, it) => sum + it.quantity, 0);
        if (!cancelled) setCount(next);
      } catch {
        // best-effort
      }
    }

    void refresh();

    const onChange = () => void refresh();
    window.addEventListener(EVENT, onChange);

    return () => {
      cancelled = true;
      window.removeEventListener(EVENT, onChange);
    };
  }, [token]);

  return count;
}
