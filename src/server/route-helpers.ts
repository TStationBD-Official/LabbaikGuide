import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { UpstreamError } from "./quran/upstream";
import { clientKey, rateLimit } from "./rate-limit";

type CachePolicy = { sMaxAge: number; swr: number } | "no-store";

/**
 * Wraps an API route: rate limiting, strict query validation, upstream error
 * mapping and cache headers. Never leaks upstream error bodies to the client.
 */
export async function handleGet<S extends z.ZodTypeAny, R>(
  req: Request,
  querySchema: S,
  run: (q: z.infer<S>) => Promise<R>,
  cache: CachePolicy,
): Promise<NextResponse> {
  const limit = rateLimit(clientKey(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const data = await run(parsed.data);
    const cacheHeader =
      cache === "no-store"
        ? "no-store"
        : `public, max-age=0, s-maxage=${cache.sMaxAge}, stale-while-revalidate=${cache.swr}`;
    return NextResponse.json(data, { headers: { "Cache-Control": cacheHeader } });
  } catch (e) {
    if (e instanceof UpstreamError) {
      const status =
        e.status === 404 ? 404 : e.status === 429 ? 429 : e.status === 504 ? 504 : e.status === 400 ? 400 : 502;
      return NextResponse.json({ error: "upstream_error" }, { status, headers: { "Cache-Control": "no-store" } });
    }
    console.error("[api] unexpected error", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "internal_error" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
