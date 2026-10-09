import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidLatLon, distanceM } from "@/features/places/geo";
import { clientKey, rateLimit } from "@/server/rate-limit";
import { osrmRoute, RoutingError } from "@/server/routing/service";

/**
 * GET /api/route/walk?from=lat,lon&to=lat,lon[&mode=drive]
 * mode=drive returns a car route (for Ziyarah trips, up to 600 km); default is on foot (up to 40 km).
 * Coordinates are used only to compute the route and are not stored or logged.
 */
const Coord = z
  .string()
  .max(40)
  .transform((s, ctx) => {
    const [lat, lon] = s.split(",").map(Number);
    if (!isValidLatLon(lat, lon)) {
      ctx.addIssue({ code: "custom", message: "bad coordinate" });
      return z.NEVER;
    }
    return { lat, lon };
  });
const Query = z.object({ from: Coord, to: Coord, mode: z.enum(["walk", "drive"]).default("walk") });

export async function GET(req: Request) {
  // Stricter than other APIs: a burst of 6, then one route every 5 s per client.
  const limit = rateLimit(`route:${clientKey(req)}`, { capacity: 6, refillPerSec: 0.2 });
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  const parsed = Query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { from, to, mode } = parsed.data;
  if (distanceM(from, to) > (mode === "drive" ? 600_000 : 40_000)) return NextResponse.json({ error: "too_far" }, { status: 422 });

  try {
    const route = await osrmRoute(from, to, mode);
    return NextResponse.json(route, { headers: { "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch (e) {
    const status = e instanceof RoutingError ? e.status : 502;
    return NextResponse.json({ error: "route_unavailable" }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
