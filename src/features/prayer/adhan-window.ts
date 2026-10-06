import { ADHAN_DURATION_MS, ADHAN_WINDOW } from "@/data/adhan/adhan-adhkar";
import { SALAH, type PrayerDay, type PrayerName } from "./times";

export type AdhanWindow = {
  prayer: PrayerName;
  adhan: Date;
  /** before: up to 5 min before · during: adhan being called · after: until 10 min after. */
  phase: "before" | "during" | "after";
  msToAdhan: number;
};

/** The adhan window (5 min before → 10 min after) that `now` falls in, if any. */
export function findAdhanWindow(now: Date, days: PrayerDay[]): AdhanWindow | null {
  const t = now.getTime();
  for (const day of days) {
    for (const p of day.prayers) {
      if (!SALAH.includes(p.name)) continue;
      const a = p.adhan.getTime();
      if (t < a - ADHAN_WINDOW.beforeMs || t > a + ADHAN_WINDOW.afterMs) continue;
      const len = p.name === "fajr" ? ADHAN_DURATION_MS.fajr : ADHAN_DURATION_MS.other;
      return { prayer: p.name, adhan: p.adhan, phase: t < a ? "before" : t < a + len ? "during" : "after", msToAdhan: a - t };
    }
  }
  return null;
}
