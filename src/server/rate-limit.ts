import "server-only";

/**
 * Best-effort in-memory token bucket per client IP. Protects the upstream
 * Quran API from abuse via our proxy. On multi-instance/serverless deployments,
 * replace with a shared store (e.g. Redis/Upstash) — the interface stays the same.
 */
type Bucket = { tokens: number; updated: number };
const buckets = new Map<string, Bucket>();
const CAPACITY = 60; // burst
const REFILL_PER_SEC = 2; // sustained 120 req/min

export function rateLimit(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: CAPACITY, updated: now };
  b.tokens = Math.min(CAPACITY, b.tokens + ((now - b.updated) / 1000) * REFILL_PER_SEC);
  b.updated = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return { ok: false, retryAfter: Math.ceil((1 - b.tokens) / REFILL_PER_SEC) };
  }
  b.tokens -= 1;
  buckets.set(key, b);
  if (buckets.size > 10_000) {
    // prevent unbounded growth
    for (const [k, v] of buckets) if (now - v.updated > 60_000) buckets.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "anon").trim();
}
