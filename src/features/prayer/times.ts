import { CalculationMethod, Coordinates, PrayerTimes } from "adhan";
import { APP_CONFIG } from "@/config/app";
import { LOCATIONS, type LocationId } from "@/config/locations";
import { addDays, hijriParts, weekdayOf, type YMD } from "./calendar";
import type { PersonName } from "@/types/haramain";

export const PRAYER_NAMES = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];
/** Sunrise is shown in the schedule but is not a prayer for "next prayer". */
export const SALAH: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export type PrayerSlot = {
  name: PrayerName;
  adhan: Date;
  iqamah: Date | null;
  imam: PersonName | null;
  muezzin: PersonName | null;
};

export type PrayerDay = {
  date: YMD;
  location: LocationId;
  isFriday: boolean;
  isRamadan: boolean;
  prayers: PrayerSlot[];
};

/**
 * Calculated times (Umm al-Qura) for the Haram coordinates. These are
 * calculations, not official announcements — the UI labels them as such.
 */
export function calculatePrayerDay(location: LocationId, date: YMD): PrayerDay {
  const loc = LOCATIONS[location];
  const params = CalculationMethod.UmmAlQura();
  const hijri = hijriParts(date);
  const isRamadan = hijri?.month === 9;
  // Umm al-Qura practice: Isha is 120 min after Maghrib in Ramadan (90 otherwise).
  if (isRamadan) params.ishaInterval = 120;

  // adhan reads only the Y/M/D of this Date; the returned instants are absolute.
  const pt = new PrayerTimes(new Coordinates(loc.latitude, loc.longitude), new Date(date.year, date.month - 1, date.day), params);
  const prayers: PrayerSlot[] = PRAYER_NAMES.map((name) => ({
    name,
    adhan: pt[name],
    iqamah: null,
    imam: null,
    muezzin: null,
  }));
  return { date, location, isFriday: weekdayOf(date) === 5, isRamadan, prayers };
}

export type PrayerStatus = "passed" | "now" | "next" | "upcoming";

export type NextPrayerInfo = {
  next: PrayerSlot;
  nextIsTomorrow: boolean;
  /** Prayer whose time is in progress (within the "now" window), if any. */
  current: PrayerSlot | null;
  msUntilNext: number;
  iqamahApproaching: boolean;
  statuses: Record<PrayerName, PrayerStatus>;
};

export function nextPrayerInfo(now: Date, today: PrayerDay, tomorrow: PrayerDay): NextPrayerInfo {
  const windowMs = APP_CONFIG.prayer.prayerNowWindowMin * 60_000;
  const t = now.getTime();
  const salahToday = today.prayers.filter((p) => SALAH.includes(p.name));
  const upcoming = salahToday.find((p) => p.adhan.getTime() > t);
  const next = upcoming ?? tomorrow.prayers.find((p) => p.name === "fajr")!;
  const current =
    [...salahToday].reverse().find((p) => {
      const start = p.adhan.getTime();
      const end = p.iqamah ? Math.max(p.iqamah.getTime() + 10 * 60_000, start + windowMs) : start + windowMs;
      return t >= start && t < end;
    }) ?? null;

  const statuses = {} as Record<PrayerName, PrayerStatus>;
  for (const p of today.prayers) {
    if (current && p.name === current.name) statuses[p.name] = "now";
    else if (upcoming && p.name === upcoming.name) statuses[p.name] = "next";
    else statuses[p.name] = p.adhan.getTime() <= t ? "passed" : "upcoming";
  }

  const iqamahApproaching = Boolean(current?.iqamah && t < current.iqamah.getTime());
  return { next, nextIsTomorrow: !upcoming, current, msUntilNext: next.adhan.getTime() - t, iqamahApproaching, statuses };
}

export function splitDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export const tomorrowOf = (d: YMD) => addDays(d, 1);
