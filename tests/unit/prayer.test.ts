import { describe, expect, it } from "vitest";
import { addDays, formatHijri, hijriParts, ymdInZone, ymdKey } from "@/features/prayer/calendar";
import { calculatePrayerDay, nextPrayerInfo, PRAYER_NAMES, splitDuration } from "@/features/prayer/times";
import { angleDiff, distanceToKaabaKm, qiblaBearing } from "@/features/prayer/qibla";

const D = { year: 2026, month: 10, day: 6 };

describe("calendar", () => {
  it("uses Asia/Riyadh for the calendar day (UTC+3)", () => {
    // 22:30 UTC on Oct 5 is already Oct 6 in Riyadh.
    expect(ymdKey(ymdInZone(new Date(Date.UTC(2026, 9, 5, 22, 30))))).toBe("2026-10-06");
    expect(ymdKey(ymdInZone(new Date(Date.UTC(2026, 9, 5, 20, 59))))).toBe("2026-10-05");
  });
  it("adds days across month/year boundaries", () => {
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({ year: 2027, month: 1, day: 1 });
  });
  it("returns Umm al-Qura Hijri parts and formats without an era marker", () => {
    const h = hijriParts(D);
    expect(h?.year).toBe(1448);
    expect(formatHijri(D, "en-GB")).not.toMatch(/AH/);
  });
});

describe("prayer times", () => {
  const day = calculatePrayerDay("makkah", D);

  it("returns six times in chronological order", () => {
    expect(day.prayers.map((p) => p.name)).toEqual([...PRAYER_NAMES]);
    for (let i = 1; i < day.prayers.length; i++) {
      expect(day.prayers[i].adhan.getTime()).toBeGreaterThan(day.prayers[i - 1].adhan.getTime());
    }
  });

  it("never invents iqamah, imam or muezzin", () => {
    for (const p of day.prayers) {
      expect(p.iqamah).toBeNull();
      expect(p.imam).toBeNull();
      expect(p.muezzin).toBeNull();
    }
  });

  it("Makkah times are plausible for early October (Riyadh time)", () => {
    const hour = (d: Date) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", hour: "2-digit", hour12: false }).format(d));
    const by = Object.fromEntries(day.prayers.map((p) => [p.name, hour(p.adhan)]));
    expect(by.fajr).toBe(4);
    expect(by.dhuhr).toBe(12);
    expect(by.maghrib).toBe(18);
  });

  it("Isha is 90 min after Maghrib outside Ramadan and 120 min in Ramadan", () => {
    const gap = (d: ReturnType<typeof calculatePrayerDay>) =>
      (d.prayers[5].adhan.getTime() - d.prayers[4].adhan.getTime()) / 60000;
    expect(day.isRamadan).toBe(false);
    expect(gap(day)).toBe(90);
    // Find a date in Ramadan 1448 via the calendar itself.
    let probe = { year: 2027, month: 1, day: 20 };
    for (let i = 0; i < 60 && hijriParts(probe)?.month !== 9; i++) probe = addDays(probe, 1);
    const ramadan = calculatePrayerDay("makkah", probe);
    expect(ramadan.isRamadan).toBe(true);
    expect(gap(ramadan)).toBe(120);
  });

  it("detects Friday", () => {
    expect(calculatePrayerDay("madinah", { year: 2026, month: 10, day: 9 }).isFriday).toBe(true);
    expect(day.isFriday).toBe(false);
  });

  it("after Isha the next prayer is tomorrow's Fajr (midnight transition)", () => {
    const tomorrow = calculatePrayerDay("makkah", addDays(D, 1));
    const lateNight = new Date(day.prayers[5].adhan.getTime() + 3 * 3600_000);
    const info = nextPrayerInfo(lateNight, day, tomorrow);
    expect(info.nextIsTomorrow).toBe(true);
    expect(info.next.name).toBe("fajr");
    expect(info.msUntilNext).toBeGreaterThan(0);
    expect(info.statuses.isha).toBe("passed");
  });

  it("marks a prayer as 'now' just after its adhan and skips sunrise as next", () => {
    const tomorrow = calculatePrayerDay("makkah", addDays(D, 1));
    const justAfterDhuhr = new Date(day.prayers[2].adhan.getTime() + 5 * 60_000);
    const info = nextPrayerInfo(justAfterDhuhr, day, tomorrow);
    expect(info.current?.name).toBe("dhuhr");
    expect(info.statuses.dhuhr).toBe("now");
    expect(info.next.name).toBe("asr");
    const afterFajr = new Date(day.prayers[0].adhan.getTime() + 20 * 60_000);
    expect(nextPrayerInfo(afterFajr, day, tomorrow).next.name).toBe("dhuhr");
  });

  it("splits durations", () => {
    expect(splitDuration(3_723_000)).toEqual({ h: 1, m: 2, s: 3 });
    expect(splitDuration(-5)).toEqual({ h: 0, m: 0, s: 0 });
  });
});

describe("qibla", () => {
  it("computes known bearings", () => {
    expect(qiblaBearing(23.8103, 90.4125)).toBeCloseTo(277.5, 0); // Dhaka
    expect(qiblaBearing(51.5074, -0.1278)).toBeCloseTo(119, 0); // London
  });
  it("computes distance to the Ka'bah", () => {
    expect(distanceToKaabaKm(24.4672, 39.6111)).toBeGreaterThan(330);
    expect(distanceToKaabaKm(24.4672, 39.6111)).toBeLessThan(345);
  });
  it("angleDiff wraps correctly", () => {
    expect(angleDiff(350, 10)).toBe(20);
    expect(angleDiff(10, 350)).toBe(-20);
  });
});
