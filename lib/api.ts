// Typed fetch wrappers. The ONLY place the frontend talks to a network. Always our backend
// (NEXT_PUBLIC_API_BASE_URL) — never the Cyber Vision Center, no token client-side.

import type { Severity } from "./tokens";
import type {
  AlertsResponse, AssetsResponse, Category, GraphResponse, HealthResponse, KpisResponse,
} from "./types";

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers: { Accept: "application/json" } });
  } catch (e) {
    // network-level failure (backend down / CORS / DNS) — distinct from an HTTP error status
    throw new ApiError(0, `Network error reaching backend: ${(e as Error).message}`);
  }
  if (!res.ok) throw new ApiError(res.status, `Backend returned ${res.status} for ${path}`);
  return (await res.json()) as T;
}

export const api = {
  health: (signal?: AbortSignal) => get<HealthResponse>("/healthz", { signal }),
  kpis: (signal?: AbortSignal) => get<KpisResponse>("/kpis", { signal }),
  assets: (signal?: AbortSignal) => get<AssetsResponse>("/assets", { signal }),
  graph: (signal?: AbortSignal) => get<GraphResponse>("/graph", { signal }),
  alerts: (
    opts: { category?: Category | null; severity?: Severity | null } = {},
    signal?: AbortSignal,
  ) => {
    const qs = new URLSearchParams();
    if (opts.category) qs.set("category", opts.category);
    if (opts.severity) qs.set("severity", opts.severity);
    const q = qs.toString();
    return get<AlertsResponse>(`/alerts${q ? `?${q}` : ""}`, { signal });
  },
};
