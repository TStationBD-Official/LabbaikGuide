import type { PrayerDay } from "./times";

/**
 * Margins used to estimate the windows below. The narrations describe the sun
 * (risen "a spear's length", at its zenith) rather than minutes, so the minute
 * values are common approximations and the UI labels them as such.
 */
export const NAFL_MARGIN_MIN = {
  /** After sunrise until the sun has fully risen (Sahih Muslim 831). */
  afterSunrise: 15,
  /** Before Dhuhr while the sun is at its zenith (Sahih Muslim 831). */
  beforeZenith: 10,
} as const;

export type NaflTimes = {
  /** Salat ad-Duha: from the sun having risen until shortly before the zenith. */
  duha: { from: Date; to: Date };
  /** Times when voluntary prayer is not offered (Sahih al-Bukhari 586, Sahih Muslim 831). */
  forbidden: { key: "afterFajr" | "zenith" | "afterAsr"; from: Date; to: Date }[];
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
  return {
    duha: { from: risen, to: zenith },
    forbidden: [
      { key: "afterFajr", from: fajr, to: risen },
      { key: "zenith", from: zenith, to: dhuhr },
      { key: "afterAsr", from: asr, to: maghrib },
    ],
  };
}
