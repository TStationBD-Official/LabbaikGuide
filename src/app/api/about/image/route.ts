import { NextResponse, type NextRequest } from "next/server";
import { allowedImage, sizedImage } from "@/server/about/service";

const WIDTHS = [96, 192, 480, 960];
const MAX_BYTES = 6 * 1024 * 1024;

/**
 * About-page images through our own origin (CSP stays `img-src 'self'`, and the
 * service worker can keep them offline). The panel gives every new upload a new
 * URL (new file id or `?v=`), so each URL's bytes never change: cached for a year.
 */
export async function GET(request: NextRequest) {
  const src = allowedImage(request.nextUrl.searchParams.get("u") ?? "");
  if (!src) return new NextResponse("Bad image", { status: 400 });
  const w = Number(request.nextUrl.searchParams.get("w"));
  const width = WIDTHS.includes(w) ? w : undefined;
  try {
    const res = await fetch(sizedImage(src, width), { signal: AbortSignal.timeout(10000), cache: "no-store" });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/") || type.includes("svg")) return new NextResponse("Not found", { status: 404 });
    const body = await res.arrayBuffer();
    if (body.byteLength > MAX_BYTES) return new NextResponse("Too large", { status: 413 });
    return new NextResponse(body, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Unavailable", { status: 502 });
  }
}
