export function getApiBaseUrl() {
  const url = import.meta.env.VITE_API_URL as string | undefined;
  if (!url) {
    // Fallback: auto-detect API URL (development or misconfiguration)
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const fallbackUrl = `${protocol}//${hostname}:3000`;
    console.warn(`VITE_API_URL not set, using fallback: ${fallbackUrl}`);
    return fallbackUrl;
  }
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
