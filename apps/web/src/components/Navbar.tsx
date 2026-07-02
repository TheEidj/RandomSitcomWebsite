import { Link } from "react-router-dom";
import { useCartCount } from "../cart/useCartCount";
import { useAuth } from "../auth/useAuth";

export function Navbar() {
  const count = useCartCount();
  const { token } = useAuth();

  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link className="font-semibold" to="/shop">
          Merch Shop
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link className="underline" to="/shop">
            Shop
          </Link>
          <Link className="underline" to="/cart">
            Cart ({count})
          </Link>
          {token && (
            <Link className="underline" to="/orders">
              My Orders
            </Link>
          )}
          <Link className="underline" to="/admin/login">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
