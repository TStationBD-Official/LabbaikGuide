import "server-only";
import { z } from "zod";
import { SERVER_CONFIG } from "@/config/server";
import type { LocationId } from "@/config/locations";
import type { HaramainSchedule } from "@/types/haramain";

/**
 * Haramain live-data architecture (spec §58):
 *
 *   Official source/API → server adapter → validation → normalized model → cache → frontend
 *
 * The upstream contract below is what an official-source adapter must return.
 * Until one is configured (HARAMAIN_SCHEDULE_URL), every method reports
 * "unavailable" — the app never guesses an Imam or Muezzin.
 */
const UpstreamSchedule = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.enum(["makkah", "madinah"]),
  scheduleDate: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  prayers: z
    .array(
      z.object({
        name: z.enum(["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"]),
        adhan: z.string().datetime({ offset: true }).optional().nullable(),
        iqamah: z.string().datetime({ offset: true }).optional().nullable(),
        imam: z.string().trim().min(1).max(120).optional().nullable(),
        muezzin: z.string().trim().min(1).max(120).optional().nullable(),
      }),
    )
    .min(1)
    .max(7),
});

const toIso = (v: string | null | undefined) => (v ? new Date(v).toISOString() : null);

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

async function fetchOfficial(location: LocationId, date: string): Promise<HaramainSchedule> {
  const { scheduleUrl, scheduleApiKey, sourceName, timeoutMs, revalidateSeconds } = SERVER_CONFIG.haramain;
  if (!scheduleUrl) return unavailable(location, date);

  const url = new URL(scheduleUrl);
  url.searchParams.set("location", location);
  url.searchParams.set("date", date);
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", ...(scheduleApiKey ? { authorization: `Bearer ${scheduleApiKey}` } : {}) },
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) return unavailable(location, date);
    const parsed = UpstreamSchedule.safeParse(await res.json());
    // Reject data for a different day or mosque rather than showing it as today's.
    if (!parsed.success || parsed.data.date !== date || parsed.data.location !== location) {
      return unavailable(location, date);
    }
    const now = new Date();
    return {
      date,
      timezone: "Asia/Riyadh",
      location,
      status: "official",
      prayers: parsed.data.prayers.map((p) => ({
        name: p.name,
        adhan: toIso(p.adhan),
        iqamah: toIso(p.iqamah),
        imam: p.imam ?? null,
        muezzin: p.muezzin ?? null,
      })),
      source: {
        name: sourceName || url.hostname,
        url: parsed.data.sourceUrl ?? null,
        scheduleDate: parsed.data.scheduleDate ?? date,
      },
      fetchedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + revalidateSeconds * 1000).toISOString(),
    };
  } catch {
    return unavailable(location, date);
  }
}

let lastUpdated: string | null = null;

export const haramainScheduleService = {
  async getPrayerSchedule(location: LocationId, date: string): Promise<HaramainSchedule> {
    const s = await fetchOfficial(location, date);
    if (s.status === "official") lastUpdated = s.fetchedAt;
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
