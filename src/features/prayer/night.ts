import type { LocationId } from "@/config/locations";
import { addDays, ymdInZone } from "./calendar";
import { calculatePrayerDay } from "./times";

export type NightTimes = {
  /** Start of the night (Maghrib). */
  maghrib: Date;
  /** End of the night (next Fajr). */
  fajr: Date;
  /** Middle of the night: halfway between Maghrib and Fajr. */
  midnight: Date;
  /** Start of the last third of the night — the best time for Tahajjud. */
  lastThird: Date;
  /** True while `now` is inside this night (after Maghrib, before Fajr). */
  current: boolean;
  /** True while `now` is inside the last third. */
  inLastThird: boolean;
};

/**
 * The night that is under way, or the coming one. The night is counted from
 * Maghrib to Fajr; its last third is the time named in Sahih al-Bukhari 1145 /
 * Sahih Muslim 758. These are calculations from the computed Maghrib and Fajr,
 * not announced times.
 */
export function nightTimes(location: LocationId, now: Date): NightTimes {
  const today = ymdInZone(now);
  const todayFajr = calculatePrayerDay(location, today).prayers.find((p) => p.name === "fajr")!.adhan;
  // Before today's Fajr we are still in the night that began yesterday.
  const start = now.getTime() < todayFajr.getTime() ? addDays(today, -1) : today;
  const maghrib = calculatePrayerDay(location, start).prayers.find((p) => p.name === "maghrib")!.adhan;
  const fajr = calculatePrayerDay(location, addDays(start, 1)).prayers.find((p) => p.name === "fajr")!.adhan;
  const len = fajr.getTime() - maghrib.getTime();
  const midnight = new Date(maghrib.getTime() + len / 2);
  const lastThird = new Date(maghrib.getTime() + (len * 2) / 3);
  const t = now.getTime();
  return {
    maghrib,
    fajr,
    midnight,
    lastThird,
    current: t >= maghrib.getTime() && t < fajr.getTime(),
    inLastThird: t >= lastThird.getTime() && t < fajr.getTime(),
  };
}
