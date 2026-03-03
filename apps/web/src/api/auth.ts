export type LoginResponse = { token: string };
export type MeResponse = { user: { id: string; role: "ADMIN" | "CUSTOMER" } };

export async function login(email: string, password: string) {
  const base = (import.meta.env.VITE_API_URL as string).replace(/\/$/, "");
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Login failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }

  return (await res.json()) as LoginResponse;
}

export async function me(token: string) {
  const base = (import.meta.env.VITE_API_URL as string).replace(/\/$/, "");
  const res = await fetch(`${base}/api/auth/me`, {
    method: "GET",
    headers: { accept: "application/json", authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Me failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  }

  return (await res.json()) as MeResponse;
}
