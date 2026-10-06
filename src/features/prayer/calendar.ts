/**
 * Calendar helpers. All Haramain calculations use Asia/Riyadh regardless of the
 * device's own time zone. Hijri dates use the Umm al-Qura calendar from ICU.
 */
export const HARAM_TZ = "Asia/Riyadh";

export type YMD = { year: number; month: number; day: number };

export function ymdInZone(date: Date, timeZone: string = HARAM_TZ): YMD {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export const ymdKey = (d: YMD) => `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;

/** Adds days to a calendar date (no time zone involved). */
export function addDays(d: YMD, days: number): YMD {
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day + days));
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

/** Noon UTC of a calendar date — a safe instant for "what day is it" questions. */
export const ymdNoonUtc = (d: YMD) => new Date(Date.UTC(d.year, d.month - 1, d.day, 12));

export function weekdayOf(d: YMD): number {
  return ymdNoonUtc(d).getUTCDay(); // 0 = Sunday, 5 = Friday
}

export function hijriParts(d: YMD): { year: number; month: number; day: number } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(ymdNoonUtc(d));
    const get = (t: string) => Number.parseInt(parts.find((p) => p.type === t)?.value ?? "", 10);
    const r = { year: get("year"), month: get("month"), day: get("day") };
    return Number.isFinite(r.year) && Number.isFinite(r.month) && Number.isFinite(r.day) ? r : null;
  } catch {
    return null;
  }
}

export function formatHijri(d: YMD, intlLocale: string): string {
  try {
    const parts = new Intl.DateTimeFormat(`${intlLocale}-u-ca-islamic-umalqura`, {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(ymdNoonUtc(d));
    // Drop the era marker (e.g. "AH" / "যুগ"); the UI already labels the date as Hijri.
    return parts
      .filter((p) => p.type !== "era")
      .map((p) => p.value)
      .join("")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

export function formatGregorian(d: YMD, intlLocale: string): string {
  return new Intl.DateTimeFormat(`${intlLocale}-u-ca-gregory`, {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ymdNoonUtc(d));
}

export function formatTime(date: Date, intlLocale: string, timeZone: string = HARAM_TZ, seconds = false): string {
  return new Intl.DateTimeFormat(intlLocale, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined,
  }).format(date);
}
