"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { distanceM, routeProgress, type Fix, type LatLon, type RouteProgress } from "@/features/places/geo";
import { ApiError, apiGet } from "@/services/api-client";
import { WalkRouteSchema, type WalkRoute } from "@/types/route";

export type WalkPath = Pick<WalkRoute, "distance" | "duration" | "coordinates">;

export type RouteStatus = "idle" | "loading" | "ok" | "rerouting" | "unavailable" | "offline";

const MIN_INTERVAL_MS = 20_000; // never ask more often than this (fair use of the public router)
const ERROR_BACKOFF_MS = 60_000;
const NEAR_M = 25; // closer than this: no route needed

/**
 * Walking route along real roads/footpaths from the live position to `to`.
 * Fetches once, then only re-routes when the user leaves the route
 * (> max(35 m, 1.2 × GPS accuracy)) — so a normal walk costs one request.
 * The last good route is kept when offline or when the router is unavailable.
 */
export function useWalkingRoute(from: Fix | null, to: LatLon | null, enabled: boolean) {
  // The route is stored with the destination it was computed for.
  const [saved, setSaved] = useState<{ key: string; route: WalkRoute | null } | null>(null);
  const [status, setStatus] = useState<RouteStatus>("idle");
  const lastReq = useRef(0);
  const blockedUntil = useRef(0);
  const inFlight = useRef<AbortController | null>(null);

  const toKey = to ? `${to.lat.toFixed(5)},${to.lon.toFixed(5)}` : null;
  const fetched = saved && saved.key === toKey ? saved.route : null;
  /** All walking paths found: the best one first, then real alternatives. */
  const routes: WalkPath[] = useMemo(() => (fetched ? [fetched, ...(fetched.alternatives ?? [])] : []), [fetched]);
  const [choice, setChoice] = useState(0);
  const chosen = routes[Math.min(choice, Math.max(0, routes.length - 1))] ?? null;
  // The chosen path, shaped like a full route (source etc. from the response).
  const route: WalkRoute | null = useMemo(() => (fetched && chosen ? { ...fetched, ...chosen } : null), [fetched, chosen]);
  const progress: RouteProgress | null = useMemo(() => (route && from ? routeProgress(route.coordinates, from) : null), [route, from]);

  useEffect(() => {
    if (!enabled || !from || !to || !toKey) return;
    const targetChanged = saved?.key !== toKey;
    if (distanceM(from, to) < NEAR_M) return;
    const offRoute = progress ? progress.offRouteM > Math.max(35, from.accuracy * 1.2) : false;
    const need = targetChanged || !route || offRoute;
    if (!need) return;
    const now = Date.now();
    if (!targetChanged && (now - lastReq.current < MIN_INTERVAL_MS || now < blockedUntil.current)) return;
    if (!targetChanged && inFlight.current) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      queueMicrotask(() => setStatus(route ? "offline" : "unavailable"));
      return;
    }

    inFlight.current?.abort();
    const ctrl = new AbortController();
    inFlight.current = ctrl;
    lastReq.current = now;
    queueMicrotask(() => setStatus(route && !targetChanged ? "rerouting" : "loading"));
    const q = `from=${from.lat.toFixed(5)},${from.lon.toFixed(5)}&to=${to.lat.toFixed(5)},${to.lon.toFixed(5)}&alt=1`;
    apiGet(`/api/route/walk?${q}`, WalkRouteSchema, { signal: ctrl.signal, timeoutMs: 15_000 })
      .then((r) => {
        setSaved({ key: toKey, route: r });
        // A fresh route (new destination, or the user left the path): start from the best one again.
        setChoice(0);
        setStatus("ok");
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        const retry = e instanceof ApiError && e.retryAfter ? e.retryAfter * 1000 : ERROR_BACKOFF_MS;
        blockedUntil.current = Date.now() + retry;
        if (targetChanged) setSaved({ key: toKey, route: null });
        setStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "unavailable");
      })
      .finally(() => {
        if (inFlight.current === ctrl) inFlight.current = null;
      });
  }, [enabled, from, to, toKey, route, progress, saved?.key]);

  useEffect(() => () => inFlight.current?.abort(), []);

  return { route, routes, choice: Math.min(choice, Math.max(0, routes.length - 1)), choose: setChoice, progress, status };
}
