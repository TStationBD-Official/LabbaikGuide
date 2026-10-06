import { KAABA } from "@/config/locations";

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Initial great-circle bearing from a point to the Ka'bah, degrees from true North. */
export function qiblaBearing(lat: number, lon: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA.latitude);
  const Δλ = toRad(KAABA.longitude - lon);
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Haversine distance to the Ka'bah in kilometres. */
export function distanceToKaabaKm(lat: number, lon: number): number {
  const R = 6371;
  const dφ = toRad(KAABA.latitude - lat);
  const dλ = toRad(KAABA.longitude - lon);
  const a = Math.sin(dφ / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(KAABA.latitude)) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Smallest signed angle a→b in degrees (-180..180]. */
export function angleDiff(a: number, b: number): number {
  return ((b - a + 540) % 360) - 180;
}
