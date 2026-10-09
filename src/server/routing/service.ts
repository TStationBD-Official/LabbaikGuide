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
        geometry: z.object({ type: z.literal("LineString"), coordinates: z.array(z.tuple([z.number(), z.number()])).min(2).max(60000) }),
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

/**
 * Keep only alternatives that are really different walks: not much longer than the best one
 * and not mostly the same streets.
 */
export function distinctPaths<T extends { distance: number; coordinates: [number, number][] }>(best: T, others: T[]): T[] {
  const cell = (c: [number, number]) => `${Math.round(c[0] / 0.0002)},${Math.round(c[1] / 0.0002)}`; // ~20 m grid
  const kept: T[] = [best];
  const out: T[] = [];
  for (const o of others) {
    if (o.distance > best.distance * 1.6 + 150) continue;
    const mine = new Set(o.coordinates.map(cell));
    const tooSimilar = kept.some((k) => {
      const theirs = new Set(k.coordinates.map(cell));
      let shared = 0;
      for (const c of mine) if (theirs.has(c)) shared++;
      return shared / Math.max(1, mine.size) > 0.85;
    });
    if (tooSimilar) continue;
    kept.push(o);
    out.push(o);
  }
  return out;
}

export type RouteMode = "walk" | "drive";

/** Keep at most `max` points (long car routes), always keeping the first and last. */
export function thin<T>(pts: T[], max: number): T[] {
  if (pts.length <= max) return pts;
  const step = (pts.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => pts[Math.round(i * step)]);
}

export async function walkingRoute(from: { lat: number; lon: number }, to: { lat: number; lon: number }): Promise<WalkRoute> {
  return osrmRoute(from, to, "walk");
}

/** Route along real roads: on foot (full detail) or by car (simplified line for long trips). */
export async function osrmRoute(from: { lat: number; lon: number }, to: { lat: number; lon: number }, mode: RouteMode): Promise<WalkRoute> {
  const f = { lat: +from.lat.toFixed(mode === "drive" ? 3 : 4), lon: +from.lon.toFixed(mode === "drive" ? 3 : 4) };
  const t = { lat: +to.lat.toFixed(5), lon: +to.lon.toFixed(5) };
  const key = `${f.lon},${f.lat};${t.lon},${t.lat}`;
  const cacheKey = `${mode}:${key}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL) return hit.route;

  const { osrmUrl, osrmCarUrl, sourceName, sourceUrl, timeoutMs } = SERVER_CONFIG.routing;
  const url =
    mode === "drive"
      ? `${osrmCarUrl.replace(/\/$/, "")}/route/v1/driving/${key}?overview=full&geometries=geojson&steps=false&alternatives=2`
      : `${osrmUrl.replace(/\/$/, "")}/route/v1/foot/${key}?overview=full&geometries=geojson&steps=false&alternatives=3`;

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
  const toPath = (r: (typeof parsed.data.routes)[number]) => ({
    distance: Math.round(r.distance),
    duration: Math.round(r.duration),
    coordinates: thin(r.geometry.coordinates, 4000).map(([lon, lat]) => [+lon.toFixed(6), +lat.toFixed(6)] as [number, number]),
  });
  const [first, ...others] = parsed.data.routes;
  const route: WalkRoute = {
    ...toPath(first),
    source: { name: sourceName, url: sourceUrl },
    alternatives: (mode === "drive" ? others.map(toPath).filter((o) => o.distance < first.distance * 1.4) : distinctPaths(toPath(first), others.map(toPath))).slice(0, 3),
  };
  cache.set(cacheKey, { at: Date.now(), route });
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value!);
  return route;
}
