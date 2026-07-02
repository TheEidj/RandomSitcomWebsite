import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { getMyOrders, type Order } from "../../../api/orders";

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadOrder = async () => {
      try {
        const data = await getMyOrders(token);
        const found = data.orders.find((o) => o.id === orderId);
        if (!found) {
          setError("Order not found");
        } else {
          setOrder(found);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [token, orderId, navigate]);

  if (loading) return <div className="p-6">Loading order...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    CANCELED: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your order</p>
      </div>

      <div className="border border-gray-200 rounded p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono text-sm">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded text-sm font-semibold ${statusColors[order.status]}`}
            >
              {order.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p>{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="font-bold text-lg">
              {(order.totalCts / 100).toFixed(2)} {order.currency}
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start border-b pb-3 last:border-b-0"
            >
              <div className="flex-1">
                <Link to={`/shop/${item.slug}`} className="font-medium hover:text-blue-600">
                  {item.title}
                </Link>
                <p className="text-sm text-gray-600">
                  {(item.unitPriceCts / 100).toFixed(2)} {order.currency} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">
                {((item.unitPriceCts * item.quantity) / 100).toFixed(2)} {order.currency}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Link to="/shop" className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
          Continue Shopping
        </Link>
        <Link to="/orders" className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-100">
          View All Orders
        </Link>
      </div>
    </div>
  );
}
