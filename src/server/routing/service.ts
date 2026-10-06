import "server-only";
import { z } from "zod";
import { SERVER_CONFIG } from "@/config/server";
import type { WalkRoute } from "@/types/route";

/**
 * Walking routes via an OSRM-compatible server (default: the public FOSSGIS
 * foot router used by openstreetmap.org — free, fair-use, max ~1 req/s).
 *
 * Fair use is enforced here, not trusted to clients:
 *  - one upstream request at a time with ≥1.1 s spacing (per server instance)
 *  - coordinates rounded (≈1–11 m) so repeated requests hit the cache
 *  - in-memory LRU + HTTP caching
 * For heavy production traffic, point ROUTING_OSRM_URL at a self-hosted OSRM.
 */
export class RoutingError extends Error {
  constructor(public status: number) {
    super(`routing ${status}`);
  }
}

const OsrmResponse = z.object({
  code: z.string(),
  routes: z
    .array(
      z.object({
        distance: z.number(),
        duration: z.number(),
        geometry: z.object({ type: z.literal("LineString"), coordinates: z.array(z.tuple([z.number(), z.number()])).min(2).max(5000) }),
      }),
    )
    .optional(),
});

const cache = new Map<string, { at: number; route: WalkRoute }>();
const CACHE_MAX = 300;
const CACHE_TTL = 1000 * 60 * 60 * 6;

let chain: Promise<unknown> = Promise.resolve();
let lastCall = 0;
const MIN_SPACING_MS = 1100;

/** Serialize upstream calls and keep them ≥1.1 s apart. */
function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const wait = lastCall + MIN_SPACING_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCall = Date.now();
    return fn();
  });
  chain = run.catch(() => undefined);
  return run;
}

export async function walkingRoute(from: { lat: number; lon: number }, to: { lat: number; lon: number }): Promise<WalkRoute> {
  const f = { lat: +from.lat.toFixed(4), lon: +from.lon.toFixed(4) };
  const t = { lat: +to.lat.toFixed(5), lon: +to.lon.toFixed(5) };
  const key = `${f.lon},${f.lat};${t.lon},${t.lat}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.route;

  const { osrmUrl, sourceName, sourceUrl, timeoutMs } = SERVER_CONFIG.routing;
  const url = `${osrmUrl.replace(/\/$/, "")}/route/v1/foot/${key}?overview=full&geometries=geojson&steps=false&alternatives=false`;

  const raw = await throttled(async () => {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { accept: "application/json", "user-agent": "LabbaikGuide/1.0 (+https://labbaikguide.vercel.app; walking routes)", referer: "https://labbaikguide.vercel.app/hotel" },
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
    } catch {
      throw new RoutingError(504);
    }
    if (res.status === 429) throw new RoutingError(429);
    if (!res.ok && res.status !== 400) throw new RoutingError(502);
    return res.json().catch(() => {
      throw new RoutingError(502);
    });
  });

  const parsed = OsrmResponse.safeParse(raw);
  if (!parsed.success) throw new RoutingError(502);
  if (parsed.data.code === "NoRoute" || parsed.data.code === "NoSegment" || !parsed.data.routes?.length) throw new RoutingError(404);
  if (parsed.data.code !== "Ok") throw new RoutingError(502);
  const r = parsed.data.routes[0];
  const route: WalkRoute = {
    distance: Math.round(r.distance),
    duration: Math.round(r.duration),
    coordinates: r.geometry.coordinates.map(([lon, lat]) => [+lon.toFixed(6), +lat.toFixed(6)] as [number, number]),
    source: { name: sourceName, url: sourceUrl },
  };
  cache.set(key, { at: Date.now(), route });
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value!);
  return route;
}
