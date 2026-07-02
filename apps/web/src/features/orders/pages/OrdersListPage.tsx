import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { getMyOrders, type Order } from "../../../api/orders";

export function OrdersListPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await getMyOrders(token);
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, navigate]);

  if (loading) return <div className="p-6">Loading orders...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    CANCELED: "bg-red-100 text-red-800",
  };

  if (orders.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
        <Link to="/shop" className="text-blue-600 hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block border border-gray-200 rounded p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded text-sm font-semibold ${statusColors[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <div className="space-y-1 mb-3">
              {order.items.map((item) => (
                <p key={item.id} className="text-sm">
                  {item.title} × {item.quantity}
                </p>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
              <p className="font-bold">
                {(order.totalCts / 100).toFixed(2)} {order.currency}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
