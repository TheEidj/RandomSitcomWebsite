import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { getCart, setCartItemQuantity, type CartResponse } from "../../../api/cart";
import { loadGuestCart, saveGuestCart } from "../../../cart/cartStorage";
import { getProducts } from "../../../api/products";

export function CartPage() {
  const { token } = useAuth();
  const [cart, setCart] = useState<CartResponse["cart"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    try {
      if (token) {
        const data = await getCart(token);
        setCart(data.cart);
      } else {
        // Guest cart: need to fetch product details
        const guestCart = loadGuestCart();
        if (guestCart.items.length === 0) {
          setCart({ items: [] });
        } else {
          // Fetch all products and match with cart items
          const productsData = await getProducts();
          const cartItems = guestCart.items
            .map((item) => {
              const product = productsData.products.find((p) => p.id === item.productId);
              if (!product) return null;
              return {
                productId: item.productId,
                quantity: item.quantity,
                product: {
                  id: product.id,
                  slug: product.slug,
                  title: product.title,
                  priceCts: product.price.amount,
                  currency: product.price.currency,
                  inStock: product.inStock,
                },
              };
            })
            .filter((item) => item !== null);
          setCart({ items: cartItems });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (!token) {
      // Guest cart: update localStorage
      const guestCart = loadGuestCart();
      const existingItem = guestCart.items.find((i) => i.productId === productId);

      if (newQuantity === 0) {
        // Remove item
        guestCart.items = guestCart.items.filter((i) => i.productId !== productId);
      } else if (existingItem) {
        // Update quantity
        existingItem.quantity = newQuantity;
      } else {
        // Add new item (shouldn't happen in cart page)
        guestCart.items.push({ productId, quantity: newQuantity });
      }

      saveGuestCart(guestCart);
      loadCart();
      return;
    }

    try {
      await setCartItemQuantity(token, productId, newQuantity);
      loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    }
  };

  const handleRemove = async (productId: string) => {
    handleQuantityChange(productId, 0);
  };

  if (loading) return <div className="p-6">Loading cart...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        <p className="text-gray-600 mb-4">Your cart is empty.</p>
        <Link to="/shop" className="text-blue-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => sum + item.product.priceCts * item.quantity, 0);
  const currency = cart.items[0]?.product.currency || "EUR";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="space-y-4 mb-8">
        {cart.items.map((item) => (
          <div key={item.productId} className="flex gap-4 border border-gray-200 rounded p-4">
            <div className="flex-1">
              <Link
                to={`/shop/${item.product.slug}`}
                className="font-semibold text-lg hover:text-blue-600"
              >
                {item.product.title}
              </Link>
              <p className="text-gray-600">
                {(item.product.priceCts / 100).toFixed(2)} {item.product.currency}
              </p>
              {!item.product.inStock && <p className="text-red-600 text-sm">Out of stock</p>}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(item.productId, Math.max(0, item.quantity - 1))}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
              >
                −
              </button>
              <span className="w-12 text-center">{item.quantity}</span>
              <button
                onClick={() =>
                  handleQuantityChange(item.productId, Math.min(99, item.quantity + 1))
                }
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <div className="flex flex-col items-end justify-between">
              <p className="font-semibold">
                {((item.product.priceCts * item.quantity) / 100).toFixed(2)} {item.product.currency}
              </p>
              <button
                onClick={() => handleRemove(item.productId)}
                className="text-red-600 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>
            {(total / 100).toFixed(2)} {currency}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/shop" className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-100">
          Continue Shopping
        </Link>
        <Link to="/checkout" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
