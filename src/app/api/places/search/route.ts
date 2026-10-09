import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocationId } from "@/config/locations";
import { isValidLatLon } from "@/features/places/geo";
import { clientKey, rateLimit } from "@/server/rate-limit";
import { searchPlaces } from "@/server/places/search";

/**
 * GET /api/places/search?q=hilton&loc=makkah&lang=en[&near=lat,lon]
 * Search text and position are used only to answer the request; nothing is stored or logged.
 */
const Query = z.object({
  q: z.string().trim().min(2).max(80),
  loc: z.string().refine(isLocationId),
  lang: z.string().max(5).default("en"),
  near: z
    .string()
    .max(40)
    .optional()
    .transform((s) => {
      if (!s) return undefined;
      const [lat, lon] = s.split(",").map(Number);
      return isValidLatLon(lat, lon) ? { lat, lon } : undefined;
    }),
});

export async function GET(req: Request) {
  // Typing sends a request every few hundred ms at most (debounced); allow bursts, not floods.
  const limit = rateLimit(`places:${clientKey(req)}`, { capacity: 30, refillPerSec: 1 });
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  const parsed = Query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { q, loc, lang, near } = parsed.data;
  try {
    const results = await searchPlaces(q, loc as "makkah" | "madinah", lang, near);
    return NextResponse.json({ results }, { headers: { "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch {
    return NextResponse.json({ error: "search_unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
