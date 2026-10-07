import type { PrayerDay } from "./times";

/**
 * Margins used to estimate the windows below. The narrations describe the sun
 * (rising until it is "a spear's length" high, at its zenith, setting) rather
 * than minutes, so these minute values are common approximations and the UI
 * labels them as such.
 */
export const NAFL_MARGIN_MIN = {
  /** From sunrise until the sun has fully risen. */
  afterSunrise: 15,
  /** Before Dhuhr, while the sun is at its zenith. */
  beforeZenith: 10,
  /** Before Maghrib, while the sun is setting. */
  beforeSunset: 15,
} as const;

/**
 * The five times when voluntary prayer is not offered:
 *  - fixed by the sun (Sahih Muslim 831): sunrise, zenith, sunset
 *  - after praying Fajr / Asr (Sahih al-Bukhari 586) — these start when the
 *    person has prayed, so the "from" shown is the earliest possible start.
 */
export type ForbiddenKey = "afterFajr" | "sunrise" | "zenith" | "afterAsr" | "sunset";
export type ForbiddenWindow = { key: ForbiddenKey; from: Date; to: Date; /** Starts after the person's own Fajr/Asr prayer. */ afterPrayer: boolean };

export type NaflTimes = {
  /** Salat ad-Duha: from the sun having risen until shortly before the zenith. */
  duha: { from: Date; to: Date };
  forbidden: ForbiddenWindow[];
};

const at = (day: PrayerDay, name: string) => day.prayers.find((p) => p.name === name)!.adhan;
const plus = (d: Date, min: number) => new Date(d.getTime() + min * 60_000);

export function naflTimes(day: PrayerDay): NaflTimes {
  const fajr = at(day, "fajr");
  const sunrise = at(day, "sunrise");
  const dhuhr = at(day, "dhuhr");
  const asr = at(day, "asr");
  const maghrib = at(day, "maghrib");
  const risen = plus(sunrise, NAFL_MARGIN_MIN.afterSunrise);
  const zenith = plus(dhuhr, -NAFL_MARGIN_MIN.beforeZenith);
  const setting = plus(maghrib, -NAFL_MARGIN_MIN.beforeSunset);
  return {
    duha: { from: risen, to: zenith },
    forbidden: [
      { key: "afterFajr", from: fajr, to: sunrise, afterPrayer: true },
      { key: "sunrise", from: sunrise, to: risen, afterPrayer: false },
      { key: "zenith", from: zenith, to: dhuhr, afterPrayer: false },
      { key: "afterAsr", from: asr, to: setting, afterPrayer: true },
      { key: "sunset", from: setting, to: maghrib, afterPrayer: false },
    ],
  };
}

/** The forbidden window `now` falls in, if any. */
export const forbiddenAt = (n: NaflTimes, now: Date) => n.forbidden.find((f) => now.getTime() >= f.from.getTime() && now.getTime() < f.to.getTime()) ?? null;
