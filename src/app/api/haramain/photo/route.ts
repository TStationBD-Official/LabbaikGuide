import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/server/rate-limit";
import { isAllowedPhotoUrl } from "@/server/haramain/service";

/**
 * Same-origin proxy for Imam/Muezzin photos published by the schedule source.
 * Only the source's own object-storage host is accepted (no open proxy), only
 * images are passed through, and size is capped. Serving from our origin keeps
 * the CSP tight (direct loads are only a fallback) and lets the service worker cache photos offline.
 */
const MAX_BYTES = 6 * 1024 * 1024;

/** Detect the real image type from magic bytes — object storage often labels files application/octet-stream. */
function sniff(b: Uint8Array): string | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  const ascii = (i: number, n: number) => String.fromCharCode(...b.slice(i, i + n));
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  if (ascii(4, 4) === "ftyp" && /^(avif|avis|heic|heix|mif1)$/.test(ascii(8, 4))) return ascii(8, 4).startsWith("avi") ? "image/avif" : "image/heic";
  return null;
}

export async function GET(req: Request) {
  const limit = rateLimit(clientKey(req));
  if (!limit.ok) return new NextResponse(null, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  const u = new URL(req.url).searchParams.get("u");
  if (!u || u.length > 2000 || !isAllowedPhotoUrl(u)) return new NextResponse(null, { status: 400 });

  try {
    const res = await fetch(u, {
      headers: { accept: "image/*", "user-agent": "LabbaikGuide/1.0 (+photo proxy)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
      next: { revalidate: 60 * 60 * 24 },
    });
    // A redirect must stay on the allowed host.
    if (!res.ok || !isAllowedPhotoUrl(res.url || u)) return new NextResponse(null, { status: 502 });
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX_BYTES) return new NextResponse(null, { status: 502 });
    const body = await res.arrayBuffer();
    if (body.byteLength > MAX_BYTES) return new NextResponse(null, { status: 502 });
    const type = sniff(new Uint8Array(body, 0, Math.min(16, body.byteLength)));
    if (!type) return new NextResponse(null, { status: 502 });
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
