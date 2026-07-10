import { getApiBaseUrl } from "./http.js";

function apiBase() {
  return getApiBaseUrl();
}

export type Order = {
  id: string;
  userId: string;
  status: "PENDING" | "PAID" | "CANCELED";
  currency: "EUR" | "USD";
  totalCts: number;
  items: Array<{
    id: string;
    productId: string;
    title: string;
    slug: string;
    unitPriceCts: number;
    quantity: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderResponse = {
  order: Order;
};

export type GetOrdersResponse = {
  orders: Order[];
};

export type GuestOrderRequest = {
  email: string;
  items: Array<{ productId: string; quantity: number }>;
  shipping: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billing?: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
};

export async function createGuestOrder(request: GuestOrderRequest) {
  const res = await fetch(`${apiBase()}/api/orders/guest`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Create guest order failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  return (await res.json()) as CreateOrderResponse;
}

export type AuthenticatedOrderRequest = {
  shipping: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billing?: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
};

export async function createOrder(token: string, request: AuthenticatedOrderRequest) {
  const res = await fetch(`${apiBase()}/api/orders`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Create order failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  return (await res.json()) as CreateOrderResponse;
}

export async function getMyOrders(token: string) {
  const res = await fetch(`${apiBase()}/api/orders/me`, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Get orders failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  return (await res.json()) as GetOrdersResponse;
}
