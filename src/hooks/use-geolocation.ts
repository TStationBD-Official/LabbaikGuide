"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { averageFixes, type Fix } from "@/features/places/geo";

export type GeoStatus = "idle" | "requesting" | "tracking" | "denied" | "unavailable" | "unsupported" | "insecure";

const toFix = (p: GeolocationPosition): Fix => ({
  lat: p.coords.latitude,
  lon: p.coords.longitude,
  accuracy: p.coords.accuracy,
  // Receipt time: device timestamps are sometimes skewed or cached.
  time: Date.now(),
  heading: Number.isFinite(p.coords.heading) ? p.coords.heading : null,
  speed: Number.isFinite(p.coords.speed) ? p.coords.speed : null,
});

function supportStatus(): GeoStatus | null {
  if (typeof window === "undefined") return null;
  if (!window.isSecureContext) return "insecure";
  if (!("geolocation" in navigator)) return "unsupported";
  return null;
}

/** Has the user already granted location access? (Never prompts.) */
export async function geolocationGranted(): Promise<boolean> {
  try {
    const r = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
    return r?.state === "granted";
  } catch {
    return false;
  }
}

/**
 * Live position via `watchPosition` (high accuracy). Rejects obvious GPS jumps,
 * restarts the watch when the page becomes visible again (mobile browsers pause
 * it in the background) and reports staleness so the UI can be honest.
 */
export function useLiveLocation() {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [fix, setFix] = useState<Fix | null>(null);
  const watchId = useRef<number | null>(null);
  const last = useRef<Fix | null>(null);
  const wanted = useRef(false);
  const rejected = useRef(0);

  const clear = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
  };

  const watch = useCallback(() => {
    clear();
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const f = toFix(pos);
        const prev = last.current;
        if (prev) {
          const dt = Math.max(1, (f.time - prev.time) / 1000);
          const dLat = (f.lat - prev.lat) * 111_320;
          const dLon = (f.lon - prev.lon) * 111_320 * Math.cos((f.lat * Math.PI) / 180);
          const jump = Math.hypot(dLat, dLon);
          // Ignore a much worse fix soon after a good one, and impossible on-foot jumps.
          const muchWorse = f.accuracy > prev.accuracy * 3 && f.accuracy > 40 && dt < 20;
          const impossible = jump / dt > 90 && jump > f.accuracy + prev.accuracy; // faster than the Haramain train
          // Drop only a single isolated glitch; a second disagreeing reading in a row is accepted
          // (real movement, or GPS recovering after being indoors).
          if ((muchWorse || impossible) && rejected.current < 1) {
            rejected.current++;
            return;
          }
        }
        rejected.current = 0;
        last.current = f;
        setFix(f);
        setStatus("tracking");
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          wanted.current = false;
          clear();
          setStatus("denied");
        } else if (!last.current) setStatus("unavailable");
        // TIMEOUT / POSITION_UNAVAILABLE while tracking: keep watching; the UI shows the fix as stale.
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20_000 },
    );
  }, []);

  const start = useCallback(() => {
    const unsupported = supportStatus();
    if (unsupported) return setStatus(unsupported);
    wanted.current = true;
    setStatus((s) => (s === "tracking" ? s : "requesting"));
    watch();
  }, [watch]);

  const stop = useCallback(() => {
    wanted.current = false;
    clear();
    setStatus("idle");
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && wanted.current) watch();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clear();
    };
  }, [watch]);

  return { status, fix, start, stop };
}

export type CaptureProgress = { fixes: number; best: number | null; elapsedMs: number };

/**
 * Collect GPS fixes for up to `maxMs` and average them for a precise saved
 * position. Finishes early once the reading is good (≤ 8 m with 3+ fixes).
 */
export function captureLocation(
  onProgress: (p: CaptureProgress) => void,
  { maxMs = 15_000, signal, seed }: { maxMs?: number; signal?: AbortSignal; seed?: Fix | null } = {},
): Promise<{ lat: number; lon: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    const unsupported = supportStatus();
    if (unsupported) return reject(new Error(unsupported));
    const t0 = Date.now();
    // A very recent live-tracking fix counts as the first reading.
    const fixes: Fix[] = seed && t0 - seed.time < 5000 ? [seed] : [];
    let done = false;
    const finish = (err?: Error) => {
      if (done) return;
      done = true;
      navigator.geolocation.clearWatch(id);
      clearTimeout(timer);
      const avg = averageFixes(fixes);
      if (err && !avg) reject(err);
      else if (avg) resolve(avg);
      else reject(new Error("unavailable"));
    };
    const onPos = (pos: GeolocationPosition) => {
      if (done) return;
      fixes.push(toFix(pos));
      const best = Math.min(...fixes.map((x) => x.accuracy));
      onProgress({ fixes: fixes.length, best, elapsedMs: Date.now() - t0 });
      const good = fixes.filter((x) => x.accuracy <= 8).length;
      if (good >= 3 || (fixes.length >= 6 && best <= 15)) finish();
    };
    const onErr = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) finish(new Error("denied"));
    };
    const opts = { enableHighAccuracy: true, maximumAge: 0, timeout: maxMs };
    // Some browsers don't give a second concurrent watcher an initial reading — ask once directly too.
    navigator.geolocation.getCurrentPosition(onPos, onErr, opts);
    const id = navigator.geolocation.watchPosition(onPos, onErr, opts);
    const timer = setTimeout(() => finish(new Error("unavailable")), maxMs);
    signal?.addEventListener("abort", () => {
      if (done) return;
      done = true;
      navigator.geolocation.clearWatch(id);
      clearTimeout(timer);
      reject(new Error("aborted"));
    });
  });
}
