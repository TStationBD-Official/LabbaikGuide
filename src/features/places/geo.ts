/**
 * Small, dependency-free geodesy helpers for the "My Hotel" navigator.
 * Everything here is pure so it can be unit-tested and used offline.
 */

export type LatLon = { lat: number; lon: number };
export type Fix = LatLon & { accuracy: number; time: number; heading?: number | null; speed?: number | null };

const R = 6_371_008.8; // mean Earth radius, metres
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance in metres (haversine). */
export function distanceM(a: LatLon, b: LatLon): number {
  const dφ = toRad(b.lat - a.lat);
  const dλ = toRad(b.lon - a.lon);
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing a→b, degrees clockwise from true North [0, 360). */
export function bearingDeg(a: LatLon, b: LatLon): number {
  const φ1 = toRad(a.lat);
  const φ2 = toRad(b.lat);
  const Δλ = toRad(b.lon - a.lon);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Destination point from `p` after `dist` metres on `bearing` degrees. */
export function destination(p: LatLon, bearing: number, dist: number): LatLon {
  const δ = dist / R;
  const θ = toRad(bearing);
  const φ1 = toRad(p.lat);
  const λ1 = toRad(p.lon);
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: toDeg(φ2), lon: ((toDeg(λ2) + 540) % 360) - 180 };
}

/** Polygon ring approximating a circle (for the GPS accuracy halo). */
export function circleRing(center: LatLon, radiusM: number, steps = 48): [number, number][] {
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const p = destination(center, (i * 360) / steps, Math.max(radiusM, 1));
    ring.push([p.lon, p.lat]);
  }
  return ring;
}

/**
 * Combine several GPS fixes into one position, weighting each by 1/accuracy².
 * Fixes much worse than the best one are dropped. Returns the combined
 * position and an honest accuracy estimate (never better than the best fix).
 */
export function averageFixes(fixes: Fix[]): (LatLon & { accuracy: number }) | null {
  const valid = fixes.filter((f) => Number.isFinite(f.lat) && Number.isFinite(f.lon) && f.accuracy > 0);
  if (!valid.length) return null;
  const best = Math.min(...valid.map((f) => f.accuracy));
  const used = valid.filter((f) => f.accuracy <= Math.max(best * 2.5, best + 10));
  let w = 0,
    lat = 0,
    lon = 0;
  for (const f of used) {
    const wi = 1 / (f.accuracy * f.accuracy);
    w += wi;
    lat += f.lat * wi;
    lon += f.lon * wi;
  }
  const accuracy = Math.max(best * 0.75, Math.sqrt(1 / w));
  return { lat: lat / w, lon: lon / w, accuracy: Math.round(accuracy * 10) / 10 };
}

/** Typical walking pace in crowded Haram areas is slower than normal (~1.1 m/s). */
export const WALK_SPEED_MPS = 1.1;
export function walkingMinutes(distM: number, speed = WALK_SPEED_MPS): number {
  return Math.max(1, Math.round(distM / speed / 60));
}

/** "You have arrived" radius: at least 25 m, more when the fix is poor (capped). */
export function arrivalRadius(accuracyM: number): number {
  return Math.min(60, Math.max(25, accuracyM));
}

export function isValidLatLon(lat: number, lon: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
}

/** Slippy-map tile containing a point at zoom z. */
export function tileXY(p: LatLon, z: number): { x: number; y: number } {
  const n = 2 ** z;
  const lat = Math.max(-85.05112878, Math.min(85.05112878, p.lat));
  const x = Math.floor(((p.lon + 180) / 360) * n);
  const y = Math.floor(((1 - Math.log(Math.tan(toRad(lat)) + 1 / Math.cos(toRad(lat))) / Math.PI) / 2) * n);
  return { x: Math.min(n - 1, Math.max(0, x)), y: Math.min(n - 1, Math.max(0, y)) };
}

/** All tiles covering the bounding box of `points` (padded by `padM`) for zooms zMin..zMax. */
export function tilesForArea(points: LatLon[], padM: number, zMin: number, zMax: number, maxTiles = 400): { z: number; x: number; y: number }[] {
  if (!points.length) return [];
  let n = -90,
    s = 90,
    e = -180,
    w = 180;
  for (const p of points) {
    n = Math.max(n, destination(p, 0, padM).lat);
    s = Math.min(s, destination(p, 180, padM).lat);
    e = Math.max(e, destination(p, 90, padM).lon);
    w = Math.min(w, destination(p, 270, padM).lon);
  }
  const out: { z: number; x: number; y: number }[] = [];
  for (let z = zMin; z <= zMax; z++) {
    const a = tileXY({ lat: n, lon: w }, z);
    const b = tileXY({ lat: s, lon: e }, z);
    for (let x = a.x; x <= b.x; x++)
      for (let y = a.y; y <= b.y; y++) {
        out.push({ z, x, y });
        if (out.length >= maxTiles) return out;
      }
  }
  return out;
}

/** Parse "lat, lon" or a maps URL containing coordinates (Google/Apple/OSM). */
/** A Google Maps share link that needs to be opened to know where it points (maps.app.goo.gl/…, goo.gl/maps/…). */
export function isShortMapLink(input: string): boolean {
  return /^(https?:\/\/)?(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)\/[\w-]+/i.test(input.trim());
}

/** The place name in a Google Maps place URL (".../maps/place/Bader+al+Hadeth+Hotel,+3263,.../data=..."). */
export function placeNameFromMapUrl(url: string): string | null {
  const m = url.match(/\/maps\/place\/([^/?#]+)/);
  if (!m) return null;
  try {
    const name = decodeURIComponent(m[1].replace(/\+/g, " ")).trim();
    return name && !/^-?\d/.test(name) ? name : null;
  } catch {
    return null;
  }
}

export function parseCoordinates(input: string): LatLon | null {
  let s = input.trim();
  try {
    s = decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    /* keep as typed */
  }
  const patterns = [
    /!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/, // google place pin: ...!3d21.42!4d39.82 (more exact than @, the view centre)
    /\/maps\/(?:search|place)\/(-?\d{1,2}\.\d+)\s*,\s*\+?(-?\d{1,3}\.\d+)/, // shared dropped pin: /maps/search/21.4185,+39.8262
    /@(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/, // google .../@21.42,39.82,17z
    /[?&](?:q|ll|query|daddr|destination)=(-?\d{1,2}(?:\.\d+)?)(?:,|%2C)\s*(-?\d{1,3}(?:\.\d+)?)/i,
    /[?&]mlat=(-?\d{1,2}(?:\.\d+)?)&mlon=(-?\d{1,3}(?:\.\d+)?)/,
    /#map=\d+\/(-?\d{1,2}(?:\.\d+)?)\/(-?\d{1,3}(?:\.\d+)?)/,
    /^geo:(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/i,
    /^(-?\d{1,2}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)$/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lon = Number(m[2]);
      if (isValidLatLon(lat, lon)) return { lat, lon };
    }
  }
  return null;
}

/** External turn-by-turn walking directions (free deep links; no API key). */
export function directionsLinks(to: LatLon, from?: LatLon | null) {
  const d = `${to.lat.toFixed(6)},${to.lon.toFixed(6)}`;
  const f = from ? `${from.lat.toFixed(6)},${from.lon.toFixed(6)}` : "";
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${d}&travelmode=walking${f ? `&origin=${f}` : ""}`,
    apple: `https://maps.apple.com/?daddr=${d}&dirflg=w${f ? `&saddr=${f}` : ""}`,
    osm: `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${f ? encodeURIComponent(f) : ""}%3B${encodeURIComponent(d)}`,
    geo: `geo:${d}?q=${d}`,
  };
}

// ── Route helpers (walking route along roads) ──────────────────────────────

/** Local planar projection around `origin` (metres); accurate for the few-km scale of a walk. */
function toXY(origin: LatLon, p: LatLon): [number, number] {
  const kx = 111_320 * Math.cos(toRad(origin.lat));
  return [(p.lon - origin.lon) * kx, (p.lat - origin.lat) * 110_574];
}

export type RouteProgress = {
  /** Distance from the user to the nearest point on the route (m). */
  offRouteM: number;
  /** Remaining distance along the route from the projected point to the end (m). */
  remainingM: number;
  /** Index of the segment the user is on. */
  segment: number;
  /** Projected position on the route. */
  snapped: LatLon;
};

/** Project `p` onto a polyline (`coords` as [lon, lat]) and measure progress. */
export function routeProgress(coords: [number, number][], p: LatLon): RouteProgress | null {
  if (coords.length < 2) return null;
  let best = { d: Infinity, seg: 0, t: 0 };
  for (let i = 0; i < coords.length - 1; i++) {
    const a = { lon: coords[i][0], lat: coords[i][1] };
    const b = { lon: coords[i + 1][0], lat: coords[i + 1][1] };
    const [ax, ay] = [0, 0];
    const [bx, by] = toXY(a, b);
    const [px, py] = toXY(a, p);
    const len2 = bx * bx + by * by;
    const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * bx + (py - ay) * by) / len2)) : 0;
    const d = Math.hypot(px - t * bx, py - t * by);
    if (d < best.d) best = { d, seg: i, t };
  }
  const a = { lon: coords[best.seg][0], lat: coords[best.seg][1] };
  const b = { lon: coords[best.seg + 1][0], lat: coords[best.seg + 1][1] };
  const snapped = { lat: a.lat + (b.lat - a.lat) * best.t, lon: a.lon + (b.lon - a.lon) * best.t };
  let remaining = distanceM(snapped, b);
  for (let i = best.seg + 1; i < coords.length - 1; i++) {
    remaining += distanceM({ lon: coords[i][0], lat: coords[i][1] }, { lon: coords[i + 1][0], lat: coords[i + 1][1] });
  }
  return { offRouteM: best.d, remainingM: remaining, segment: best.seg, snapped };
}

/** Point `aheadM` metres further along the route from the user's projected position. */
export function pointAhead(coords: [number, number][], prog: RouteProgress, aheadM: number): LatLon {
  let left = aheadM;
  let from = prog.snapped;
  for (let i = prog.segment + 1; i < coords.length; i++) {
    const next = { lon: coords[i][0], lat: coords[i][1] };
    const d = distanceM(from, next);
    if (d >= left) {
      const k = left / d;
      return { lat: from.lat + (next.lat - from.lat) * k, lon: from.lon + (next.lon - from.lon) * k };
    }
    left -= d;
    from = next;
  }
  const last = coords[coords.length - 1];
  return { lon: last[0], lat: last[1] };
}

/** The part of the route still ahead of the user (for drawing). */
export function remainingPath(coords: [number, number][], prog: RouteProgress): [number, number][] {
  return [[prog.snapped.lon, prog.snapped.lat], ...coords.slice(prog.segment + 1)];
}
