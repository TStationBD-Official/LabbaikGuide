import "server-only";
import { z } from "zod";
import { LOCATIONS, type LocationId } from "@/config/locations";
import { GATE_CORRECTIONS, UNRELIABLE_REFS, VERIFIED_GATES, type VerifiedGate } from "@/data/haram-gates";

export const HARAM_MAP_TAG = "haram-map";

/** Public Overpass endpoints (tried in order). */
const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass.private.coffee/api/interpreter"];

/** Search radius around each mosque (m). Madinah reaches Al-Baqi to the east. */
const RADIUS: Record<LocationId, number> = { makkah: 650, madinah: 750 };

export type PoiKind = "gate" | "toilets" | "water" | "zamzam" | "medical" | "landmark";
export type Landmark = "kaaba" | "maqam" | "blackstone" | "safa" | "marwah" | "zamzam" | "rawdah" | "greenDome" | "baqi" | "mosque";
export type Poi = {
  id: string;
  kind: PoiKind;
  lat: number;
  lon: number;
  name?: string;
  nameEn?: string;
  nameAr?: string;
  /** Gate number, from `ref` or the digits in the name. */
  num?: number;
  /** For gates: what the door is for, as tagged. */
  role?: "main" | "entrance" | "exit" | "emergency" | "service";
  restricted?: boolean;
  wheelchair?: "yes" | "no" | "limited";
  gender?: "male" | "female";
  landmark?: Landmark;
  /** Part of the mosque's mapped outline (not a nearby hotel door). */
  onMosque?: boolean;
  /** Position checked by hand (see src/data/haram-gates.ts), not from OpenStreetMap. */
  verified?: boolean;
};
export type HaramMapData = { location: LocationId; pois: Poi[]; source: "OpenStreetMap"; fetchedAt: string };

const GATE_NAME = /(^|\s)(gate|bab|door)(\s|$)|باب|بوابة/i;
/** Doors of hotels, towers and malls around the Haram (e.g. "Gate 4 - Jabal Omar Jumeirah") are not Haram gates. */
const NOT_HARAM = /hotel|tower|jabal|jabel|omar|hilton|hyatt|conrad|jumeirah|swiss|fairmont|pullman|raffles|mövenpick|movenpick|marriott|hostel|mall|floor|food|kebab|restaurant|parking|tunnel|فندق|برج|أبراج|مول|مطعم|موقف|نفق/i;
const LANDMARKS: [Landmark, RegExp][] = [
  ["kaaba", /الكعبة|kaaba|ka'?bah|ka`bah/i],
  ["maqam", /مقام\s*إبراهيم|مقام\s*ابراهيم|maqam\s*ibrah/i],
  ["blackstone", /الحجر\s*الأسود|black\s*stone|hajar\s*al-?aswad/i],
  ["safa", /(^|\s|ال)صفا($|\s)|(^|\s)(as-?|al-?)?safa($|\s)|mount safa/i],
  ["marwah", /المروة|(^|\s)(al-?)?marwa(h)?($|\s)/i],
  ["zamzam", /زمزم|zam\s*zam/i],
  ["rawdah", /الروضة\s*الشريفة|riyad|rawd(ah|a)|riaz/i],
  ["greenDome", /القبة\s*الخضراء|green\s*dome/i],
  ["baqi", /البقيع|baqi|baqee/i],
];

/** Arabic-Indic / Persian digits → ASCII, then the first number in the text. */
export function numberIn(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const ascii = text.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  const m = ascii.match(/\d{1,3}/);
  return m ? Number(m[0]) : undefined;
}

const Element = z.object({
  type: z.string(),
  id: z.number(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string(), z.string()).optional(),
});
const Response = z.object({ elements: z.array(z.unknown()) });

/** Turn one OSM element into a point of interest, or null if it is not one we show. */
export function classify(el: z.infer<typeof Element>, onMosque: boolean): Poi | null {
  const t = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat === undefined || lon === undefined) return null;
  const name = t.name || undefined;
  const nameEn = t["name:en"] || undefined;
  const nameAr = t["name:ar"] || undefined;
  const allNames = [name, nameEn, nameAr, t.alt_name, t.official_name].filter(Boolean).join(" | ");
  const base = { id: `${el.type[0]}${el.id}`, lat, lon, name, nameEn, nameAr };
  const wheelchair = t.wheelchair === "yes" || t.wheelchair === "no" || t.wheelchair === "limited" ? t.wheelchair : undefined;

  const amenity = t.amenity;
  if (amenity === "toilets") {
    const gender = t.female === "yes" && t.male !== "yes" ? "female" : t.male === "yes" && t.female !== "yes" ? "male" : undefined;
    return { ...base, kind: "toilets", gender, wheelchair };
  }
  if (amenity === "drinking_water" || amenity === "water_point") return { ...base, kind: /زمزم|zam\s*zam/i.test(allNames) ? "zamzam" : "water" };
  if (amenity === "first_aid" || amenity === "clinic" || amenity === "hospital" || amenity === "doctors" || t.healthcare || t.emergency === "first_aid_kit") {
    return { ...base, kind: "medical" };
  }

  const isEntrance = Boolean(t.entrance) || Boolean(t.door) || t.barrier === "gate";
  const namedGate = GATE_NAME.test(allNames);
  // A numbered door (ref) near the Haram is a Haram gate even when it isn't drawn on the mosque outline.
  const numbered = numberIn(t.ref) !== undefined;
  const notHaram = NOT_HARAM.test(allNames) || el.type === "relation";
  if (
    !notHaram &&
    ((isEntrance && (onMosque || namedGate || numbered)) || (namedGate && !t.highway && !t.building && !t.amenity && !t.shop && !t.tourism))
  ) {
    const e = t.entrance;
    const role = e === "main" ? "main" : e === "exit" ? "exit" : e === "emergency" ? "emergency" : e === "service" ? "service" : "entrance";
    return {
      ...base,
      kind: "gate",
      num: numberIn(t.ref) ?? numberIn(nameEn) ?? numberIn(name) ?? numberIn(nameAr),
      role,
      restricted: t.access === "no" || t.access === "private" || role === "emergency" || role === "service",
      wheelchair,
      onMosque,
    };
  }

  for (const [key, re] of LANDMARKS) if (re.test(allNames)) return { ...base, kind: key === "zamzam" ? "zamzam" : "landmark", landmark: key };
  return null;
}

/** Distance in metres (equirectangular; fine at this scale). */
const metres = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const x = (b.lon - a.lon) * Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  return Math.hypot(x, b.lat - a.lat) * 111_320;
};

/**
 * Drop duplicates: the same gate number within 40 m, or the same kind with the same (non-empty) name
 * within 15 m. Neighbouring gates without names (e.g. 83 and 84, 8 m apart) are different gates.
 */
export function dedupe(pois: Poi[]): Poi[] {
  const out: Poi[] = [];
  for (const p of pois) {
    const dup = out.some((q) => {
      if (q.kind !== p.kind) return false;
      const d = metres(p, q);
      if (p.kind === "gate" && p.num !== undefined && q.num !== undefined) return p.num === q.num && d < 40;
      if (p.name && q.name) return p.name === q.name && d < 15;
      return p.kind !== "gate" && p.num === undefined && q.num === undefined && !p.name && !q.name && d < 3;
    });
    if (!dup) out.push(p);
  }
  return out;
}

/** Official gate numbers win over OSM; numbers from an unofficial sequence are removed. */
export function applyCorrections(pois: Poi[], location: LocationId): Poi[] {
  const fix = new Map(GATE_CORRECTIONS[location].map((c) => [c.osmId, c]));
  const bad = UNRELIABLE_REFS[location];
  return pois.map((p) => {
    if (p.kind !== "gate") return p;
    const c = fix.get(p.id);
    // The OSM names carry the old numbers too ("Umra Gate 40"), so they are replaced with the official ones.
    if (c) return { ...p, num: c.num, nameEn: c.nameEn ?? p.nameEn, nameAr: c.nameAr ?? p.nameAr, name: c.nameAr ?? p.name };
    if (p.num !== undefined && bad.some((r) => p.num! >= r.from && p.num! <= r.to)) return { ...p, num: undefined };
    return p;
  });
}

export function buildQuery(location: LocationId): string {
  const { latitude: lat, longitude: lon } = LOCATIONS[location];
  const r = RADIUS[location];
  const at = `(around:${r},${lat},${lon})`;
  // 1) doors that are part of the mosque's own outline; then a separator; 2) everything else of interest.
  return `[out:json][timeout:25];
(way(around:150,${lat},${lon})["amenity"="place_of_worship"]["religion"="muslim"];rel(around:150,${lat},${lon})["amenity"="place_of_worship"]["religion"="muslim"];)->.m;
(.m;way(r.m);way(around:150,${lat},${lon})["building"]["name"~"المسجد|Masjid|Mosque",i];)->.mw;
(node(w.mw)["entrance"];node(w.mw)["door"];)->.mg;
.mg out tags;
out count;
(
  .mg;
  nwr${at}["name"~"باب|بوابة|Gate|Bab ",i];
  node${at}["ref"]["entrance"];
  node${at}["ref"]["door"];
  nwr${at}["amenity"~"^(toilets|drinking_water|water_point|first_aid|clinic|hospital|doctors)$"];
  nwr${at}["healthcare"];
  nwr${at}["name"~"الكعبة|Kaaba|Ka.bah|مقام|Maqam|الحجر الأسود|Black Stone|الصفا|Safa|المروة|Marwa|زمزم|Zamzam|الروضة|Rawdah|Riyad|القبة الخضراء|Green Dome|البقيع|Baqi",i];
);
out center tags;`;
}

/** Parse an Overpass response: everything before the `count` separator sits on the mosque outline. */
export function parseOverpass(json: unknown, location: LocationId): Poi[] {
  const { elements } = Response.parse(json);
  const pois: Poi[] = [];
  let onMosque = true;
  const seen = new Set<string>();
  for (const raw of elements) {
    const parsed = Element.safeParse(raw);
    if (!parsed.success) continue;
    if (parsed.data.type === "count") {
      onMosque = false;
      continue;
    }
    // First block: ids of the doors on the mosque outline (they come again, with coordinates, after the separator).
    const key = `${parsed.data.type}${parsed.data.id}`;
    if (onMosque) {
      seen.add(key);
      continue;
    }
    const p = classify(parsed.data, seen.has(key));
    if (p) pois.push(p);
  }
  return dedupe(applyCorrections(pois, location)).sort((a, b) => (a.num ?? 9999) - (b.num ?? 9999));
}

/** Hand-checked gates replace OpenStreetMap gates with the same number. */
export function mergeVerified(pois: Poi[], verified: VerifiedGate[]): Poi[] {
  if (!verified.length) return pois;
  const nums = new Set(verified.map((g) => g.num));
  const own: Poi[] = verified.map((g) => ({
    id: `v${g.num}`,
    kind: "gate",
    lat: g.lat,
    lon: g.lon,
    name: g.nameAr ?? g.nameEn,
    nameEn: g.nameEn,
    nameAr: g.nameAr,
    num: g.num,
    role: g.role ?? "entrance",
    restricted: g.role === "emergency" || g.role === "service",
    onMosque: true,
    verified: true,
  }));
  return [...pois.filter((p) => !(p.kind === "gate" && p.num !== undefined && nums.has(p.num))), ...own].sort((a, b) => (a.num ?? 9999) - (b.num ?? 9999));
}

export async function getHaramMap(location: LocationId): Promise<HaramMapData> {
  const q = buildQuery(location).replace(".mg out tags;", ".mg out ids;");
  let lastErr: unknown;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "LabbaikGuide/1.0 (Umrah & Hajj companion; labbaikguide.vercel.app)" },
        body: `data=${encodeURIComponent(q)}`,
        signal: AbortSignal.timeout(30_000),
        next: { revalidate: 86_400, tags: [HARAM_MAP_TAG] },
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      const pois = mergeVerified(parseOverpass(await res.json(), location), VERIFIED_GATES[location]);
      return { location, pois, source: "OpenStreetMap", fetchedAt: new Date().toISOString() };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Overpass unavailable");
}
