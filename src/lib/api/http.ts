import { API_BASE_URL } from "@/lib/api/config";
import { ApiError, type ApiEnvelope } from "@/lib/api/types";

export type HttpOptions = {
  method?: string;
  body?: unknown;
  formData?: FormData;
  token?: string | null;
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

async function parseEnvelope<T>(response: Response): Promise<T> {
  const text = await response.text();
  let json: ApiEnvelope<T> | null = null;

  if (text) {
    try {
      json = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      throw new ApiError(
        response.status,
        "invalid_json",
        text.slice(0, 180) || "Invalid API response",
      );
    }
  }

  if (!response.ok || json?.success === false) {
    const code = json?.error?.code || `http_${response.status}`;
    const message =
      json?.error?.message ||
      (response.status === 401
        ? "Invalid email or password"
        : "Request failed");
    throw new ApiError(response.status, code, message, json?.error?.details);
  }

  return (json?.data ?? null) as T;
}

export async function httpRequest<T>(
  path: string,
  options: HttpOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (!options.formData) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method:
      options.method ||
      (options.body || options.formData ? "POST" : "GET"),
    headers,
    body: options.formData
      ? options.formData
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
    signal: options.signal,
    cache: options.cache,
    next: options.next,
  });

  return parseEnvelope<T>(response);
}

export function unwrapList<T>(
  data:
    | T[]
    | { items?: T[]; categories?: T[]; states?: T[]; lgas?: T[] }
    | null,
  key?: "items" | "categories" | "states" | "lgas",
): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (key && Array.isArray(data[key])) return data[key] as T[];
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.categories)) return data.categories;
  if (Array.isArray(data.states)) return data.states;
  if (Array.isArray(data.lgas)) return data.lgas;
  return [];
}

export { parseEnvelope };
