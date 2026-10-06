import { describe, expect, it } from "vitest";
import { normalizeHaramainImams } from "@/server/haramain/service";

const person = (en: string, ar: string) => ({ id: "x", nameEn: en, nameAr: ar, image: "https://example.com/a.jpg" });
const FEED = [
  { date: "2026-10-05", prayer: "isha", time: "19:35", hijriDate: "24/4/1448", imam: person("Yesterday Imam", "إمام الأمس"), muezzin: person("Y M", "م") },
  { date: "2026-10-06", prayer: "fajr", time: "04:58", hijriDate: "25/4/1448", imam: person("Saleh Awad Al-Maghamisi", "صالح عواد المغامسي"), muezzin: person("Anas Nazih Al-Sharif", "أنس بن نزيه الشريف") },
  { date: "2026-10-06", prayer: "Dhuhr", time: "12:10", hijriDate: "25/4/1448", imam: person("Dr. Abdulbari Awad Al-Thubaity", "د. عبدالباري بن عواض الثبيتي"), muezzin: null },
  { date: "2026-10-06", prayer: "tahajjud", time: "02:00", imam: person("Other", "آخر") },
];

describe("haramainimams.com adapter", () => {
  it("keeps only today's prayers, normalises names and casing, never invents times", () => {
    const s = normalizeHaramainImams(FEED, "madinah", "2026-10-06", "https://haramainimams.com");
    expect(s.status).toBe("available");
    expect(s.prayers.map((p) => p.name)).toEqual(["fajr", "dhuhr"]);
    expect(s.prayers[0].imam).toEqual({ en: "Saleh Awad Al-Maghamisi", ar: "صالح عواد المغامسي" });
    expect(s.prayers[1].muezzin).toBeNull();
    expect(s.prayers.every((p) => p.adhan === null && p.iqamah === null)).toBe(true);
    expect(s.source?.name).toMatch(/haramainimams\.com/);
  });

  it("reports unavailable when there is nothing for today", () => {
    expect(normalizeHaramainImams(FEED, "madinah", "2026-10-07", "x").status).toBe("unavailable");
  });

  it("reports unavailable for unexpected shapes instead of guessing", () => {
    expect(normalizeHaramainImams({ error: "nope" }, "makkah", "2026-10-06", "x").status).toBe("unavailable");
    expect(normalizeHaramainImams([{ date: "2026-10-06", prayer: "fajr", imam: { nameEn: "" , nameAr: "" } }], "makkah", "2026-10-06", "x").status).toBe("unavailable");
  });
});
