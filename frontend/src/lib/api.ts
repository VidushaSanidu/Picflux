const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;

  const headers: HeadersInit = isFormData
    ? { ...(init?.headers as Record<string, string>) }
    : { "Content-Type": "application/json", ...(init?.headers as Record<string, string>) };

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(res.status, (body as { message?: string }).message ?? "Request failed");
  }

  // 204 No Content or empty body
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
