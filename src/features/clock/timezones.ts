/**
 * Home-country clocks offered next to Makkah time. Country names are localised
 * at runtime with Intl.DisplayNames; the city is shown for multi-zone countries.
 */
export type HomeZone = { tz: string; country: string; flag: string; city?: string };

export const HOME_ZONES: HomeZone[] = [
  { tz: "Asia/Dhaka", country: "BD", flag: "🇧🇩" },
  { tz: "Asia/Karachi", country: "PK", flag: "🇵🇰" },
  { tz: "Asia/Kolkata", country: "IN", flag: "🇮🇳" },
  { tz: "Asia/Kathmandu", country: "NP", flag: "🇳🇵" },
  { tz: "Asia/Colombo", country: "LK", flag: "🇱🇰" },
  { tz: "Indian/Maldives", country: "MV", flag: "🇲🇻" },
  { tz: "Asia/Jakarta", country: "ID", flag: "🇮🇩", city: "Jakarta" },
  { tz: "Asia/Kuala_Lumpur", country: "MY", flag: "🇲🇾" },
  { tz: "Asia/Singapore", country: "SG", flag: "🇸🇬" },
  { tz: "Asia/Dubai", country: "AE", flag: "🇦🇪" },
  { tz: "Asia/Qatar", country: "QA", flag: "🇶🇦" },
  { tz: "Asia/Kuwait", country: "KW", flag: "🇰🇼" },
  { tz: "Asia/Muscat", country: "OM", flag: "🇴🇲" },
  { tz: "Asia/Bahrain", country: "BH", flag: "🇧🇭" },
  { tz: "Africa/Cairo", country: "EG", flag: "🇪🇬" },
  { tz: "Europe/Istanbul", country: "TR", flag: "🇹🇷" },
  { tz: "Africa/Lagos", country: "NG", flag: "🇳🇬" },
  { tz: "Africa/Casablanca", country: "MA", flag: "🇲🇦" },
  { tz: "Europe/London", country: "GB", flag: "🇬🇧" },
  { tz: "Europe/Paris", country: "FR", flag: "🇫🇷" },
  { tz: "Europe/Berlin", country: "DE", flag: "🇩🇪" },
  { tz: "America/New_York", country: "US", flag: "🇺🇸", city: "New York" },
  { tz: "America/Chicago", country: "US", flag: "🇺🇸", city: "Chicago" },
  { tz: "America/Los_Angeles", country: "US", flag: "🇺🇸", city: "Los Angeles" },
  { tz: "America/Toronto", country: "CA", flag: "🇨🇦", city: "Toronto" },
  { tz: "Australia/Sydney", country: "AU", flag: "🇦🇺", city: "Sydney" },
];

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** UTC offset of `tz` at `date`, in minutes. */
export function tzOffsetMinutes(tz: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"));
  return Math.round((asUtc - Math.floor(date.getTime() / 60_000) * 60_000) / 60_000);
}

/** Difference home − Makkah in minutes (e.g. Dhaka → +180). */
export function diffFromMakkah(tz: string, date: Date): number {
  return tzOffsetMinutes(tz, date) - tzOffsetMinutes("Asia/Riyadh", date);
}

/** Localised place label: "Bangladesh", or "United States · New York". */
export function zoneLabel(z: HomeZone | null, tz: string, intlLocale: string): string {
  let country = "";
  try {
    if (z) country = new Intl.DisplayNames([intlLocale], { type: "region" }).of(z.country) ?? z.country;
  } catch {
    country = z?.country ?? "";
  }
  if (z) return z.city ? `${country} · ${z.city}` : country;
  return tz.split("/").pop()!.replace(/_/g, " ");
}

export const findZone = (tz: string) => HOME_ZONES.find((z) => z.tz === tz) ?? null;
