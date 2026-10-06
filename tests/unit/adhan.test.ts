import { describe, expect, it } from "vitest";
import { findAdhanWindow } from "@/features/prayer/adhan-window";
import { calculatePrayerDay } from "@/features/prayer/times";
import { ADHAN_LINES, AFTER_ADHAN } from "@/data/adhan/adhan-adhkar";

const day = calculatePrayerDay("makkah", { year: 2026, month: 10, day: 6 });
const at = (name: string) => day.prayers.find((p) => p.name === name)!.adhan.getTime();

describe("adhan window", () => {
  it("opens 5 min before and closes 10 min after each adhan, with phases", () => {
    const isha = at("isha");
    expect(findAdhanWindow(new Date(isha - 6 * 60_000), [day])).toBeNull();
    expect(findAdhanWindow(new Date(isha - 4 * 60_000), [day])).toMatchObject({ prayer: "isha", phase: "before" });
    expect(findAdhanWindow(new Date(isha + 60_000), [day])).toMatchObject({ prayer: "isha", phase: "during" });
    expect(findAdhanWindow(new Date(isha + 6 * 60_000), [day])).toMatchObject({ prayer: "isha", phase: "after" });
    expect(findAdhanWindow(new Date(isha + 11 * 60_000), [day])).toBeNull();
  });
  it("never opens for sunrise", () => {
    expect(findAdhanWindow(new Date(at("sunrise")), [day])).toBeNull();
  });
});

describe("adhan content", () => {
  it("answers both 'ḥayya' lines with lā ḥawla (Muslim 385) and repeats the rest", () => {
    const withReply = ADHAN_LINES.filter((l) => l.reply).map((l) => l.id);
    expect(withReply).toEqual(["hayya-salah", "hayya-falah"]);
    expect(ADHAN_LINES.find((l) => l.id === "tathwib")?.fajrOnly).toBe(true);
  });
  it("has the dua after adhan with its source", () => {
    expect(AFTER_ADHAN.map((d) => d.ref)).toContain("Sahih al-Bukhari 614");
  });
});
