import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocationId } from "@/config/locations";
import { isShortMapLink } from "@/features/places/geo";
import { clientKey, rateLimit } from "@/server/rate-limit";
import { resolveMapLink } from "@/server/places/resolve-link";
import { sameName, searchPlaces } from "@/server/places/search";

/**
 * GET /api/places/resolve?url=https://maps.app.goo.gl/…&loc=makkah&lang=en
 * → { coords | null, name | null, results: places matching the name in the city }
 * The link is used only to answer this request; nothing is stored or logged.
 */
const Query = z.object({
  url: z.string().trim().max(300).refine(isShortMapLink),
  loc: z.string().refine(isLocationId),
  lang: z.string().max(5).default("en"),
});

export async function GET(req: Request) {
  const limit = rateLimit(`resolve:${clientKey(req)}`, { capacity: 10, refillPerSec: 0.2 });
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const parsed = Query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { url, loc, lang } = parsed.data;
  try {
    const r = await resolveMapLink(url);
    let results: Awaited<ReturnType<typeof searchPlaces>> = [];
    if (!r.coords && r.name) {
      // "Bader al Hadeth Hotel, 3263, Jarham، …, Makkah 24233, Saudi Arabia" → search the name part first.
      const short = r.name.split(/[,،]/)[0].trim();
      // Only places that really carry that name — a similar-sounding hotel would send the user to the wrong door.
      results = (await searchPlaces(short, loc as "makkah" | "madinah", lang).catch(() => [])).filter((h) => sameName(short, h.name));
    }
    return NextResponse.json({ coords: r.coords, name: r.name, results }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
  } catch {
    return NextResponse.json({ error: "link_unreadable" }, { status: 422, headers: { "Cache-Control": "no-store" } });
  }
}
