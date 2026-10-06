import type { z } from "zod";
import type { TKey } from "@/i18n";

export type ApiErrorKind =
  | "network"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "rateLimited"
  | "server"
  | "invalid"
  | "unknown";

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    public status?: number,
    message?: string,
  ) {
    super(message ?? kind);
    this.name = "ApiError";
  }
  /** 4xx (other than 408/429) won't succeed on retry. */
  get retryable(): boolean {
    return ["network", "timeout", "rateLimited", "server", "unknown"].includes(this.kind);
  }
}

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "notFound";
  if (status === 408) return "timeout";
  if (status === 429) return "rateLimited";
  if (status >= 500) return "server";
  return "unknown";
}

export function errorMessageKey(error: unknown): TKey {
  if (typeof navigator !== "undefined" && !navigator.onLine) return "errors.offlineNoCache";
  if (!(error instanceof ApiError)) return "errors.generic";
  switch (error.kind) {
    case "network":
      return "errors.network";
    case "timeout":
      return "errors.timeout";
    case "notFound":
      return "errors.notFound";
    case "rateLimited":
      return "errors.rateLimited";
    case "unauthorized":
    case "forbidden":
      return "errors.unauthorized";
    case "server":
      return "errors.server";
    default:
      return "errors.generic";
  }
}

/**
 * Browser → our own API routes. Every response is validated with Zod so a
 * changed upstream shape fails loudly instead of rendering garbage.
 */
export async function apiGet<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
  { signal, timeoutMs = 15000 }: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<z.infer<S>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException("timeout", "TimeoutError")), timeoutMs);
  const onAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", onAbort);
  let res: Response;
  try {
    res = await fetch(path, { signal: controller.signal, headers: { accept: "application/json" } });
  } catch (e) {
    if (signal?.aborted) throw e;
    if (e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError")) {
      throw new ApiError("timeout");
    }
    throw new ApiError("network");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
  if (!res.ok) throw new ApiError(kindFromStatus(res.status), res.status);
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("invalid", res.status, "Invalid JSON");
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) throw new ApiError("invalid", res.status, parsed.error.message);
  return parsed.data;
}
