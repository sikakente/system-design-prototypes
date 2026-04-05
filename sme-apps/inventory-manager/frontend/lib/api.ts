const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

let tokenCache: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.value;
  try {
    const res = await fetch('/api/auth/token');
    if (!res.ok) return null;
    const { accessToken } = (await res.json()) as { accessToken: string | null };
    if (accessToken) {
      tokenCache = { value: accessToken, expiresAt: Date.now() + 50 * 60 * 1000 };
    }
    return accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((body as { message?: string }).message ?? 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
