/**
 * Custom error type for HTTP-related failures.
 * Includes both HTTP status and message for easier debugging.
 */
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const BASE = import.meta.env.VITE_SWAPI_BASE ?? 'https://sw-api.starnavi.io';

/**
 * Lightweight HTTP helper for typed API requests.
 *
 * Features:
 * - Automatically prepends the base URL (configurable via `.env`).
 * - Throws a `HttpError` when the response is not OK (status 4xx–5xx).
 * - Returns a typed JSON result (`Promise<T>`).
 * - Merges user-provided headers with the default `application/json`.
 *
 * Example:
 * ```ts
 * const people = await http<Person[]>('/people/');
 * ```
 */
export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  // Throw a structured error if response is not OK
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new HttpError(res.status, text || res.statusText);
  }

  // Parse JSON and cast to the expected type
  return (await res.json()) as T;
}
