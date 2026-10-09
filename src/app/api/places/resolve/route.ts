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

/**
 * The neighbourhood named in the address ("…, Jarham، 3263 8782, Makkah 24233, …" → Jarham), so the
 * map can open close to the place for the user to put the pin on it. Approximate by design.
 */
async function areaOf(name: string, loc: "makkah" | "madinah", lang: string) {
  const parts = name
    .split(/[,،]/)
    .slice(1)
    .map((p) => p.replace(/\d+/g, "").trim())
    .filter((p) => p.length > 2 && !/saudi|arabia|السعودية|makkah|mecca|madinah|medina|مكة|المدينة/i.test(p));
  for (const part of parts) {
    const hits = await searchPlaces(part, loc, lang).catch(() => []);
    const hit = hits.find((h) => h.kind === "place" || h.kind === "street") ?? hits[0];
    if (hit) return { name: part, lat: hit.lat, lon: hit.lon };
  }
  return null;
}

export async function GET(req: Request) {
  const limit = rateLimit(`resolve:${clientKey(req)}`, { capacity: 10, refillPerSec: 0.2 });
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const parsed = Query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { url, loc, lang } = parsed.data;
  try {
    const r = await resolveMapLink(url);
    let results: Awaited<ReturnType<typeof searchPlaces>> = [];
    let area: { name: string; lat: number; lon: number } | null = null;
    if (!r.coords && r.name) {
      // "Bader al Hadeth Hotel, 3263, Jarham، …, Makkah 24233, Saudi Arabia" → search the name part first.
      const short = r.name.split(/[,،]/)[0].trim();
      // Only places that really carry that name — a similar-sounding hotel would send the user to the wrong door.
      results = (await searchPlaces(short, loc as "makkah" | "madinah", lang).catch(() => [])).filter((h) => sameName(short, h.name));
      if (!results.length) area = await areaOf(r.name, loc as "makkah" | "madinah", lang);
    }
    return NextResponse.json({ coords: r.coords, name: r.name, results, area }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
  } catch {
    return NextResponse.json({ error: "link_unreadable" }, { status: 422, headers: { "Cache-Control": "no-store" } });
  }
}
