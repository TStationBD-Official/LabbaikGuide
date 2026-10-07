import { NextResponse } from "next/server";

/**
 * King Fahd Complex (QCF) Mushaf page fonts, one file per page (1–604).
 * Served same-origin from the files published with the Quran.com web reader,
 * pinned to one commit so the glyph codes from the API always match the fonts.
 * Responses are immutable and cached by the CDN and the service worker.
 */
const SOURCE = "https://raw.githubusercontent.com/quran/quran.com-frontend-next/aff1a035b09b66f28047b3216edcae4c5c949a49/public/fonts/quran/hafs";
const PATHS = {
  v1: "v1/woff2",
  v2: "v2/woff2",
  v4: "v4/colrv1/woff2", // Tajweed, COLRv1 colour glyphs (light and dark palettes)
} as const;

export async function GET(_req: Request, ctx: { params: Promise<{ ver: string; file: string }> }) {
  const { ver, file } = await ctx.params;
  const m = /^([1-9]\d{0,2})\.woff2$/.exec(file);
  const page = m ? Number(m[1]) : 0;
  if (!(ver in PATHS) || page < 1 || page > 604) return new NextResponse("Not found", { status: 404 });

  let res: Response;
  try {
    res = await fetch(`${SOURCE}/${PATHS[ver as keyof typeof PATHS]}/p${page}.woff2`, {
      cache: "force-cache",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return new NextResponse("Upstream unavailable", { status: 502 });
  }
  if (!res.ok) return new NextResponse("Upstream error", { status: 502 });
  const body = await res.arrayBuffer();
  // Only ever pass on a real WOFF2 file.
  const sig = new Uint8Array(body, 0, Math.min(4, body.byteLength));
  if (body.byteLength < 1000 || String.fromCharCode(...sig) !== "wOF2") return new NextResponse("Bad font", { status: 502 });

  return new NextResponse(body, {
    headers: {
      "Content-Type": "font/woff2",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
