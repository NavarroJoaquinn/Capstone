export const AUTH  = import.meta.env.VITE_AUTH_URL as string;
export const DATA  = import.meta.env.VITE_DATASETS_URL as string;
export const ANALYT = import.meta.env.VITE_ANALYTICS_URL as string;

export async function api<T>(url: string, init: RequestInit = {}, token?: string): Promise<T> {
  const baseHeaders: Record<string, string> = {
    ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    ...init,
    headers: {
      ...baseHeaders,
      ...(init.headers ? (init.headers as Record<string, string>) : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return (await res.json()) as T;
}