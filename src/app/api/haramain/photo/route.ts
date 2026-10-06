import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/server/rate-limit";
import { isAllowedPhotoUrl } from "@/server/haramain/service";

/**
 * Same-origin proxy for Imam/Muezzin photos published by the schedule source.
 * Only the source's own object-storage host is accepted (no open proxy), only
 * images are passed through, and size is capped. Serving from our origin keeps
 * the CSP at `img-src 'self'` and lets the service worker cache photos offline.
 */
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = /^image\/(jpeg|png|webp|gif|avif)$/;

export async function GET(req: Request) {
  const limit = rateLimit(clientKey(req));
  if (!limit.ok) return new NextResponse(null, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  const u = new URL(req.url).searchParams.get("u");
  if (!u || u.length > 1000 || !isAllowedPhotoUrl(u)) return new NextResponse(null, { status: 400 });

  try {
    const res = await fetch(u, {
      headers: { accept: "image/*", "user-agent": "LabbaikGuide/1.0 (+photo proxy)" },
      signal: AbortSignal.timeout(8000),
      redirect: "error",
      next: { revalidate: 60 * 60 * 24 },
    });
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!res.ok || !ALLOWED_TYPES.test(type)) return new NextResponse(null, { status: 502 });
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX_BYTES) return new NextResponse(null, { status: 502 });
    const body = await res.arrayBuffer();
    if (body.byteLength > MAX_BYTES) return new NextResponse(null, { status: 502 });
    return new NextResponse(body, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=2592000",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
