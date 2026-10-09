import "server-only";
import { isShortMapLink, parseCoordinates, placeNameFromMapUrl, type LatLon } from "@/features/places/geo";

/**
 * Opens a Google Maps share link (maps.app.goo.gl/…) only far enough to read where it redirects —
 * the redirect address itself, never the Google page. From that address we take the pin's
 * coordinates when present, otherwise the place's name (which the client then searches for).
 */
const ALLOWED = /^(maps\.app\.goo\.gl|goo\.gl|g\.co|(www\.|maps\.)?google\.[a-z.]+|consent\.google\.[a-z.]+)$/i;

export type ResolvedLink = { url: string; coords: LatLon | null; name: string | null };

export async function resolveMapLink(input: string): Promise<ResolvedLink> {
  if (!isShortMapLink(input)) throw new Error("not a short map link");
  let url = new URL(/^https?:/i.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
  for (let hop = 0; hop < 5; hop++) {
    const coords = parseCoordinates(url.href);
    if (coords) return { url: url.href, coords, name: placeNameFromMapUrl(url.href) };
    if (/\/maps\/place\//.test(url.pathname)) return { url: url.href, coords: null, name: placeNameFromMapUrl(url.href) };
    // A cookie-consent page carries the real address in ?continue=
    const cont = url.searchParams.get("continue");
    if (/^consent\./i.test(url.hostname) && cont) {
      url = new URL(cont);
      continue;
    }
    if (!ALLOWED.test(url.hostname) || url.protocol !== "https:") throw new Error("unexpected host");
    const res = await fetch(url, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(6000), headers: { "user-agent": "Mozilla/5.0 (compatible; LabbaikGuide/1.0; +https://labbaikguide.vercel.app)" }, cache: "no-store" });
    const loc = res.headers.get("location");
    await res.body?.cancel();
    if (!loc || res.status < 300 || res.status >= 400) break;
    url = new URL(loc, url);
  }
  return { url: url.href, coords: parseCoordinates(url.href), name: placeNameFromMapUrl(url.href) };
}
