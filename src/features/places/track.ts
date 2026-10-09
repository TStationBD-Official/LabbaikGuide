import { z } from "zod";
import { distanceM, type Fix } from "@/features/places/geo";

/**
 * A walk recorded on the Haram map. Kept on this device only (localStorage),
 * so it survives a refresh or the phone closing the tab.
 */

/** Average step length of an adult walking in a crowd (m). Steps are an estimate. */
export const STEP_M = 0.72;
export const stepsFor = (m: number) => Math.round(m / STEP_M);

/** A new waypoint is added after moving at least this far (m) — less is GPS jitter. */
export const MIN_STEP_M = 4;
/** Fixes worse than this (m) are not recorded. */
export const MAX_ACCURACY_M = 35;
const MAX_POINTS = 5000;

const Point = z.tuple([z.number(), z.number(), z.number()]); // lon, lat, time (ms)
export const TrackSchema = z.object({
  v: z.literal(1),
  on: z.boolean(),
  points: z.array(Point),
  walked: z.number(),
  /** Time spent recording (ms), not counting pauses. */
  activeMs: z.number(),
  /** When the current recording stretch started (ms), or null when paused. */
  resumedAt: z.number().nullable(),
});
export type Track = z.infer<typeof TrackSchema>;

export const EMPTY_TRACK: Track = { v: 1, on: false, points: [], walked: 0, activeMs: 0, resumedAt: null };

export const TRACK_KEY = "hc_haram_track_v1";

export function loadTrack(raw: string | null): Track {
  if (!raw) return EMPTY_TRACK;
  try {
    const r = TrackSchema.safeParse(JSON.parse(raw));
    return r.success ? r.data : EMPTY_TRACK;
  } catch {
    return EMPTY_TRACK;
  }
}

export function startTrack(t: Track, now: number): Track {
  return t.on ? t : { ...t, on: true, resumedAt: now };
}

export function stopTrack(t: Track, now: number): Track {
  if (!t.on) return t;
  return { ...t, on: false, activeMs: t.activeMs + (t.resumedAt !== null ? Math.max(0, now - t.resumedAt) : 0), resumedAt: null };
}

/** Recording time so far (ms). */
export function elapsedMs(t: Track, now: number): number {
  return t.activeMs + (t.on && t.resumedAt !== null ? Math.max(0, now - t.resumedAt) : 0);
}

/** Adds a GPS fix as a waypoint when recording, accurate enough and far enough from the last one. */
export function addFix(t: Track, fix: Fix): Track {
  if (!t.on || fix.accuracy > MAX_ACCURACY_M) return t;
  const last = t.points[t.points.length - 1];
  if (last) {
    const d = distanceM({ lon: last[0], lat: last[1] }, fix);
    if (d < MIN_STEP_M) return t;
    return { ...t, walked: t.walked + d, points: [...t.points.slice(-(MAX_POINTS - 1)), [fix.lon, fix.lat, fix.time]] };
  }
  return { ...t, points: [[fix.lon, fix.lat, fix.time]] };
}
