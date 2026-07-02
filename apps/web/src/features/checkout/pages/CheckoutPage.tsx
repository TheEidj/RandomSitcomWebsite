import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { getCart, type CartResponse } from "../../../api/cart";
import { createOrder, createGuestOrder } from "../../../api/orders";
import { loadGuestCart, clearGuestCart } from "../../../cart/cartStorage";
import { getProducts } from "../../../api/products";
import { CheckoutAuthModal } from "../components/CheckoutAuthModal";

type CartItem = CartResponse["cart"]["items"][number];

export function CheckoutPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  useEffect(() => {
    const loadCartData = async () => {
      try {
        if (token) {
          // Authenticated user: load from API
          const data = await getCart(token);
          if (data.cart.items.length === 0) {
            navigate("/cart");
            return;
          }
          setItems(data.cart.items);
        } else {
          // Guest user: check if they've chosen to checkout as guest
          if (!isGuestCheckout) {
            // Show modal to choose auth method
            setShowAuthModal(true);
            setLoading(false);
            return;
          }

          // Load from localStorage for guest checkout
          const guestCart = loadGuestCart();
          if (guestCart.items.length === 0) {
            navigate("/cart");
            return;
          }

          // Fetch product details
          const productsData = await getProducts();
          const cartItems: CartItem[] = guestCart.items
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
            .filter((item): item is CartItem => item !== null);

          setItems(cartItems);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    loadCartData();
  }, [token, navigate, isGuestCheckout]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!token && !formData.email) {
      setError("Please provide your email address");
      return;
    }

    if (
      !formData.fullName ||
      !formData.address ||
      !formData.city ||
      !formData.postalCode ||
      !formData.country
    ) {
      setError("Please fill in all shipping address fields");
      return;
    }

    if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv) {
      setError("Please fill in all payment fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // In real app: validate card, process payment, etc.
      // Here we just create the order (simulating instant payment success)

      if (token) {
        // Authenticated checkout
        const result = await createOrder(token, {
          shipping: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone || undefined,
          },
        });
        navigate(`/orders/${result.order.id}`);
      } else {
        // Guest checkout
        const result = await createGuestOrder({
          email: formData.email,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shipping: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone || undefined,
          },
        });
        clearGuestCart();
        navigate(`/orders/${result.order.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestCheckout = () => {
    setIsGuestCheckout(true);
    setShowAuthModal(false);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
    navigate("/cart");
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error && items.length === 0) return <div className="p-6 text-red-600">Error: {error}</div>;

  // Show modal if not authenticated and haven't chosen guest checkout
  if (!token && !isGuestCheckout && showAuthModal) {
    return <CheckoutAuthModal onClose={handleCloseModal} onGuestCheckout={handleGuestCheckout} />;
  }

  if (items.length === 0) return null;

  const total = items.reduce((sum, item) => sum + item.product.priceCts * item.quantity, 0);
  const currency = items[0]?.product.currency || "EUR";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (guest only) */}
          {!token && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
            </div>
          )}

          {/* Shipping Address */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-3">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Street Address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone (optional)"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="space-y-3">
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number (1234 5678 9012 3456)"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="cardExpiry"
                  placeholder="MM/YY"
                  value={formData.cardExpiry}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  name="cardCvv"
                  placeholder="CVV"
                  value={formData.cardCvv}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {submitting ? "Processing..." : `Place Order (${(total / 100).toFixed(2)} ${currency})`}
          </button>
        </form>

        {/* Right: Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="border border-gray-200 rounded p-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.product.title}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  {((item.product.priceCts * item.quantity) / 100).toFixed(2)}{" "}
                  {item.product.currency}
                </p>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>
                  {(total / 100).toFixed(2)} {currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
