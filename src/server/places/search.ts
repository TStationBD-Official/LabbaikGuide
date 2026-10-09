import "server-only";
import { z } from "zod";
import { LOCATIONS, type LocationId } from "@/config/locations";

/**
 * Place search ("search as you type") for hotels, streets and landmarks, via Photon
 * (komoot's OpenStreetMap geocoder made for autocomplete; free, fair use).
 * Results are limited to the selected city so "Hilton" finds the Makkah Hiltons, not Chicago's.
 * Queries are cached and spaced out here; the client also debounces.
 */
const PHOTON = process.env.PHOTON_URL ?? "https://photon.komoot.io";

/** Search area per city: minLon, minLat, maxLon, maxLat (wide enough for Aziziyah, Mina, Quba…). */
const BBOX: Record<LocationId, [number, number, number, number]> = {
  makkah: [39.65, 21.25, 40.05, 21.6],
  madinah: [39.4, 24.3, 39.85, 24.65],
};

export type PlaceHit = {
  id: string;
  name: string;
  /** Street · district · city — what makes two same-named places distinguishable. */
  detail: string;
  lat: number;
  lon: number;
  kind: "hotel" | "mosque" | "street" | "food" | "shop" | "transport" | "health" | "place";
};

const Feature = z.object({
  geometry: z.object({ coordinates: z.tuple([z.number(), z.number()]) }),
  properties: z
    .object({
      osm_type: z.string().optional(),
      osm_id: z.number().optional(),
      name: z.string().optional(),
      street: z.string().optional(),
      housenumber: z.string().optional(),
      district: z.string().optional(),
      city: z.string().optional(),
      osm_key: z.string().optional(),
      osm_value: z.string().optional(),
    })
    .passthrough(),
});
const Response = z.object({ features: z.array(z.unknown()) });

export function kindOf(key?: string, value?: string): PlaceHit["kind"] {
  if (key === "tourism" && /hotel|hostel|guest_house|apartment|motel/.test(value ?? "")) return "hotel";
  if (value === "place_of_worship" || value === "mosque") return "mosque";
  if (key === "highway" && !/bus_stop/.test(value ?? "")) return "street";
  if (key === "amenity" && /restaurant|cafe|fast_food|food_court/.test(value ?? "")) return "food";
  if (key === "shop" || value === "marketplace" || value === "mall") return "shop";
  if (key === "railway" || key === "public_transport" || value === "bus_station" || value === "bus_stop" || value === "taxi") return "transport";
  if (key === "amenity" && /hospital|clinic|pharmacy|doctors/.test(value ?? "")) return "health";
  return "place";
}

/** Turn a Photon response into results (named places only, duplicates removed). */
export function parsePhoton(json: unknown): PlaceHit[] {
  const { features } = Response.parse(json);
  const out: PlaceHit[] = [];
  const seen = new Set<string>();
  for (const raw of features) {
    const f = Feature.safeParse(raw);
    if (!f.success) continue;
    const p = f.data.properties;
    const [lon, lat] = f.data.geometry.coordinates;
    const name = p.name?.trim() || [p.street, p.housenumber].filter(Boolean).join(" ");
    if (!name) continue;
    const detail = [p.street && p.street !== name ? [p.street, p.housenumber].filter(Boolean).join(" ") : null, p.district, p.city].filter(Boolean).join(" · ");
    // The same street comes back once per segment: keep the first of each name+area.
    const key = `${name}|${p.district ?? ""}|${kindOf(p.osm_key, p.osm_value)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: `${p.osm_type ?? "x"}${p.osm_id ?? out.length}`, name, detail, lat: +lat.toFixed(6), lon: +lon.toFixed(6), kind: kindOf(p.osm_key, p.osm_value) });
  }
  return out;
}

const cache = new Map<string, { at: number; hits: PlaceHit[] }>();
const TTL = 1000 * 60 * 60 * 12;
let last = 0;

export async function searchPlaces(q: string, loc: LocationId, lang: string, near?: { lat: number; lon: number }): Promise<PlaceHit[]> {
  const query = q.trim().replace(/\s+/g, " ").slice(0, 80);
  // Photon understands these languages; others get local (often Arabic + English) names.
  const l = ["en", "de", "fr"].includes(lang) ? lang : "default";
  const key = `${loc}|${l}|${query.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.hits;

  const c = near ?? { lat: LOCATIONS[loc].latitude, lon: LOCATIONS[loc].longitude };
  const params = new URLSearchParams({ q: query, limit: "10", lat: c.lat.toFixed(4), lon: c.lon.toFixed(4), bbox: BBOX[loc].join(",") });
  if (l !== "default") params.set("lang", l);
  // Keep requests to the public server spaced out (fair use).
  const wait = last + 250 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
  const res = await fetch(`${PHOTON}/api/?${params}`, {
    headers: { accept: "application/json", "user-agent": "LabbaikGuide/1.0 (+https://labbaikguide.vercel.app; place search)" },
    signal: AbortSignal.timeout(6000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`photon ${res.status}`);
  const hits = parsePhoton(await res.json()).slice(0, 8);
  cache.set(key, { at: Date.now(), hits });
  if (cache.size > 2000) cache.delete(cache.keys().next().value!);
  return hits;
}
