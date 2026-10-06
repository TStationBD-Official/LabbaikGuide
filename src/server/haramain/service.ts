import "server-only";
import { z } from "zod";
import { SERVER_CONFIG } from "@/config/server";
import type { LocationId } from "@/config/locations";
import type { HaramainSchedule, PersonName } from "@/types/haramain";

/**
 * Haramain live-data architecture (spec §58):
 *
 *   Source → server adapter → validation → normalized model → cache → frontend
 *
 * Providers (HARAMAIN_SCHEDULE_PROVIDER):
 *   - "haramainimams" (default): the public JSON feed behind haramainimams.com
 *   - "custom": any service implementing the contract in `CustomSchedule`
 *   - "none": always report "unavailable"
 *
 * Anything that fails validation, or is not for today's date and this mosque,
 * becomes "unavailable" — the app never guesses an Imam or Muezzin.
 */

type Adapter = (location: LocationId, date: string) => Promise<HaramainSchedule>;

const PRAYER = z.enum(["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]);
const NAME = z.string().trim().min(1).max(160);

function unavailable(location: LocationId, date: string): HaramainSchedule {
  const now = new Date();
  return {
    date,
    timezone: "Asia/Riyadh",
    location,
    status: "unavailable",
    prayers: [],
    source: null,
    fetchedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 5 * 60_000).toISOString(),
  };
}

async function getJson(url: URL, headers: Record<string, string> = {}): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "LabbaikGuide/1.0 (+schedule adapter)", ...headers },
      signal: AbortSignal.timeout(SERVER_CONFIG.haramain.timeoutMs),
      next: { revalidate: SERVER_CONFIG.haramain.revalidateSeconds },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ───────────────────────── haramainimams.com adapter ─────────────────────────
const HiPerson = z.object({ nameEn: NAME, nameAr: NAME }).passthrough();
const HiEntry = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    prayer: z.string().transform((v) => v.toLowerCase()),
    time: z.string().optional().nullable(),
    hijriDate: z.string().optional().nullable(),
    imam: HiPerson.nullable().optional(),
    muezzin: HiPerson.nullable().optional(),
  })
  .passthrough();
const HiFeed = z.array(HiEntry).max(500);

const HI_SLUG: Record<LocationId, string> = { makkah: "mecca", madinah: "madinah" };
const person = (p: z.infer<typeof HiPerson> | null | undefined): PersonName | null =>
  p ? { en: p.nameEn, ar: p.nameAr } : null;

export function normalizeHaramainImams(raw: unknown, location: LocationId, date: string, baseUrl: string): HaramainSchedule {
  const parsed = HiFeed.safeParse(raw);
  if (!parsed.success) return unavailable(location, date);

  const prayers: HaramainSchedule["prayers"] = [];
  const seen = new Set<string>();
  for (const e of parsed.data) {
    if (e.date !== date) continue; // only today's assignments, never another day's
    const name = PRAYER.safeParse(e.prayer);
    if (!name.success || seen.has(name.data)) continue;
    seen.add(name.data);
    const imam = person(e.imam);
    const muezzin = person(e.muezzin);
    if (!imam && !muezzin) continue;
    // Adhan times stay calculated (Umm al-Qura) in the UI; only staff names come from this feed.
    prayers.push({ name: name.data, adhan: null, iqamah: null, imam, muezzin });
  }
  if (!prayers.length) return unavailable(location, date);

  const now = new Date();
  return {
    date,
    timezone: "Asia/Riyadh",
    location,
    status: "available",
    prayers,
    source: { name: "Haramain Schedules (haramainimams.com)", url: baseUrl, scheduleDate: date },
    fetchedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SERVER_CONFIG.haramain.revalidateSeconds * 1000).toISOString(),
  };
}

const haramainImamsAdapter: Adapter = async (location, date) => {
  const base = SERVER_CONFIG.haramain.haramainImamsBase.replace(/\/$/, "");
  const raw = await getJson(new URL(`${base}/api/prayers/${HI_SLUG[location]}`));
  return raw === null ? unavailable(location, date) : normalizeHaramainImams(raw, location, date, base);
};

// ───────────────────────── custom contract adapter ─────────────────────────
const CustomPerson = z.union([NAME.transform((n) => ({ en: n, ar: n })), z.object({ en: NAME, ar: NAME })]);
const CustomSchedule = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.enum(["makkah", "madinah"]),
  scheduleDate: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  prayers: z
    .array(
      z.object({
        name: PRAYER,
        adhan: z.string().datetime({ offset: true }).optional().nullable(),
        iqamah: z.string().datetime({ offset: true }).optional().nullable(),
        imam: CustomPerson.optional().nullable(),
        muezzin: CustomPerson.optional().nullable(),
      }),
    )
    .min(1)
    .max(7),
});

const customAdapter: Adapter = async (location, date) => {
  const { scheduleUrl, scheduleApiKey, sourceName, revalidateSeconds } = SERVER_CONFIG.haramain;
  if (!scheduleUrl) return unavailable(location, date);
  const url = new URL(scheduleUrl);
  url.searchParams.set("location", location);
  url.searchParams.set("date", date);
  const parsed = CustomSchedule.safeParse(await getJson(url, scheduleApiKey ? { authorization: `Bearer ${scheduleApiKey}` } : {}));
  if (!parsed.success || parsed.data.date !== date || parsed.data.location !== location) return unavailable(location, date);
  const iso = (v: string | null | undefined) => (v ? new Date(v).toISOString() : null);
  const now = new Date();
  return {
    date,
    timezone: "Asia/Riyadh",
    location,
    status: "available",
    prayers: parsed.data.prayers.map((p) => ({
      name: p.name,
      adhan: iso(p.adhan),
      iqamah: iso(p.iqamah),
      imam: p.imam ?? null,
      muezzin: p.muezzin ?? null,
    })),
    source: { name: sourceName || url.hostname, url: parsed.data.sourceUrl ?? null, scheduleDate: parsed.data.scheduleDate ?? date },
    fetchedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + revalidateSeconds * 1000).toISOString(),
  };
};

const ADAPTERS: Record<string, Adapter> = {
  haramainimams: haramainImamsAdapter,
  custom: customAdapter,
  none: async (location, date) => unavailable(location, date),
};

let lastUpdated: string | null = null;

export const haramainScheduleService = {
  async getPrayerSchedule(location: LocationId, date: string): Promise<HaramainSchedule> {
    const adapter = ADAPTERS[SERVER_CONFIG.haramain.provider] ?? ADAPTERS.none;
    const s = await adapter(location, date);
    if (s.status === "available") lastUpdated = s.fetchedAt;
    return s;
  },
  async getImamSchedule(location: LocationId, date: string) {
    const s = await this.getPrayerSchedule(location, date);
    return s.prayers.map((p) => ({ name: p.name, imam: p.imam }));
  },
  async getMuezzinSchedule(location: LocationId, date: string) {
    const s = await this.getPrayerSchedule(location, date);
    return s.prayers.map((p) => ({ name: p.name, muezzin: p.muezzin }));
  },
  getLastUpdated: () => lastUpdated,
};
