export function getApiBaseUrl() {
  const url = import.meta.env.VITE_API_URL as string | undefined;
  if (!url) throw new Error("VITE_API_URL is not defined");
  return url.replace(/\/$/, "");
}

export async function httpGet<T>(path: string): Promise<T> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GET ${path} failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
    );
  }

  return (await res.json()) as T;
}
