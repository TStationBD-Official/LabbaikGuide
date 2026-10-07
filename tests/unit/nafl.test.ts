import { describe, expect, it } from "vitest";
import { naflTimes, NAFL_MARGIN_MIN } from "@/features/prayer/nafl";
import { calculatePrayerDay } from "@/features/prayer/times";

const day = calculatePrayerDay("makkah", { year: 2026, month: 10, day: 7 });
const t = (n: string) => day.prayers.find((p) => p.name === n)!.adhan.getTime();

describe("Duha and forbidden times", () => {
  const n = naflTimes(day);
  it("Duha runs from after sunrise until before the zenith", () => {
    expect(n.duha.from.getTime()).toBe(t("sunrise") + NAFL_MARGIN_MIN.afterSunrise * 60_000);
    expect(n.duha.to.getTime()).toBe(t("dhuhr") - NAFL_MARGIN_MIN.beforeZenith * 60_000);
    expect(n.duha.to.getTime()).toBeGreaterThan(n.duha.from.getTime());
  });
  it("forbidden windows are ordered and never overlap Duha", () => {
    const [f, z, a] = n.forbidden;
    expect(f).toMatchObject({ key: "afterFajr" });
    expect(f.from.getTime()).toBe(t("fajr"));
    expect(f.to.getTime()).toBe(n.duha.from.getTime());
    expect(z.from.getTime()).toBe(n.duha.to.getTime());
    expect(z.to.getTime()).toBe(t("dhuhr"));
    expect(a.from.getTime()).toBe(t("asr"));
    expect(a.to.getTime()).toBe(t("maghrib"));
  });
});
