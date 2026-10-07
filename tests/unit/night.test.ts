import { describe, expect, it } from "vitest";
import { nightTimes } from "@/features/prayer/night";
import { calculatePrayerDay } from "@/features/prayer/times";

const at = (y: number, m: number, d: number, hh: number, mm: number) => new Date(Date.UTC(y, m - 1, d, hh - 3, mm)); // Riyadh time
const time = (loc: "makkah" | "madinah", y: number, m: number, d: number, name: string) =>
  calculatePrayerDay(loc, { year: y, month: m, day: d }).prayers.find((p) => p.name === name)!.adhan.getTime();

describe("night times (Tahajjud)", () => {
  it("in the evening uses tonight: today's Maghrib to tomorrow's Fajr", () => {
    const n = nightTimes("makkah", at(2026, 10, 6, 22, 0));
    expect(n.maghrib.getTime()).toBe(time("makkah", 2026, 10, 6, "maghrib"));
    expect(n.fajr.getTime()).toBe(time("makkah", 2026, 10, 7, "fajr"));
    expect(n.current).toBe(true);
    expect(n.inLastThird).toBe(false);
  });

  it("after midnight stays on the night that began yesterday", () => {
    const n = nightTimes("makkah", at(2026, 10, 7, 3, 9));
    expect(n.maghrib.getTime()).toBe(time("makkah", 2026, 10, 6, "maghrib"));
    expect(n.fajr.getTime()).toBe(time("makkah", 2026, 10, 7, "fajr"));
    expect(n.inLastThird).toBe(true);
  });

  it("splits the night into halves and thirds", () => {
    const n = nightTimes("madinah", at(2026, 10, 6, 12, 0));
    const len = n.fajr.getTime() - n.maghrib.getTime();
    expect(n.midnight.getTime() - n.maghrib.getTime()).toBeCloseTo(len / 2, -1);
    expect(n.fajr.getTime() - n.lastThird.getTime()).toBeCloseTo(len / 3, -1);
    expect(n.current).toBe(false); // midday → the coming night
    expect(n.maghrib.getTime()).toBeGreaterThan(at(2026, 10, 6, 12, 0).getTime());
  });
});
