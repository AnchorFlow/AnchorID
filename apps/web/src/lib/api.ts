const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
  }
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
  cache?: RequestCache;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, accessToken, cache = 'no-store' } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message = (data && (data.message as string)) || res.statusText;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message, data);
  }

  return data as T;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  accessToken: string,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message = (data && (data.message as string)) || res.statusText;
    throw new ApiError(res.status, Array.isArray(message) ? message.join(', ') : message, data);
  }

  return data as T;
}
