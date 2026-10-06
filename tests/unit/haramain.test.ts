import { describe, expect, it } from "vitest";
import { isAllowedPhotoUrl, normalizeHaramainImams } from "@/server/haramain/service";

const PHOTO = "https://objectstorage.me-jeddah-1.oraclecloud.com/p/abc/n/x/b/prh/o/employee_1.jpg";
const person = (en: string, ar: string, image = "https://example.com/a.jpg") => ({ id: "x", nameEn: en, nameAr: ar, image });
const FEED = [
  { date: "2026-10-05", prayer: "isha", time: "19:35", hijriDate: "24/4/1448", imam: person("Yesterday Imam", "إمام الأمس"), muezzin: person("Y M", "م") },
  { date: "2026-10-06", prayer: "fajr", time: "04:58", hijriDate: "25/4/1448", imam: person("Saleh Awad Al-Maghamisi", "صالح عواد المغامسي"), muezzin: person("Anas Nazih Al-Sharif", "أنس بن نزيه الشريف") },
  { date: "2026-10-06", prayer: "Dhuhr", time: "12:10", hijriDate: "25/4/1448", imam: person("Dr. Abdulbari Awad Al-Thubaity", "د. عبدالباري بن عواض الثبيتي"), muezzin: null },
  { date: "2026-10-06", prayer: "tahajjud", time: "02:00", imam: person("Other", "آخر") },
  { date: "2026-10-08", prayer: "asr", imam: person("Asr Imam", "إمام العصر", PHOTO), muezzin: null },
  { date: "2026-10-07", prayer: "isha", imam: person("Isha Imam", "إمام العشاء"), muezzin: null },
  { date: "2026-10-07", prayer: "fajr", imam: person("Fajr Imam", "إمام الفجر"), muezzin: null },
  { date: "2026-10-07", prayer: "dhuhr", imam: null, muezzin: null },
];

describe("haramainimams.com adapter", () => {
  it("keeps only today's prayers, normalises names and casing, never invents times", () => {
    const s = normalizeHaramainImams(FEED, "madinah", "2026-10-06", "https://haramainimams.com");
    expect(s.status).toBe("available");
    expect(s.prayers.map((p) => p.name)).toEqual(["fajr", "dhuhr"]);
    expect(s.prayers[0].imam).toEqual({ en: "Saleh Awad Al-Maghamisi", ar: "صالح عواد المغامسي", image: null });
    expect(s.prayers[1].muezzin).toBeNull();
    expect(s.prayers.every((p) => p.adhan === null && p.iqamah === null)).toBe(true);
    expect(s.source?.name).toMatch(/haramainimams\.com/);
  });

  it("passes through already-published future days in order, without past days or empty rows", () => {
    const s = normalizeHaramainImams(FEED, "madinah", "2026-10-06", "x");
    expect(s.upcoming.map((d) => d.date)).toEqual(["2026-10-07", "2026-10-08"]);
    expect(s.upcoming[0].prayers.map((p) => p.name)).toEqual(["fajr", "isha"]);
  });

  it("only proxies photos from the source's own storage host", () => {
    const s = normalizeHaramainImams(FEED, "madinah", "2026-10-06", "x");
    expect(s.upcoming[1].prayers[0].imam?.image).toBe(`/api/haramain/photo?u=${encodeURIComponent(PHOTO)}`);
    expect(isAllowedPhotoUrl(PHOTO)).toBe(true);
    expect(isAllowedPhotoUrl("https://example.com/a.jpg")).toBe(false);
    expect(isAllowedPhotoUrl("http://objectstorage.me-jeddah-1.oraclecloud.com/x.jpg")).toBe(false);
    expect(isAllowedPhotoUrl("https://objectstorage.me-jeddah-1.oraclecloud.com.evil.com/x.jpg")).toBe(false);
  });

  it("reports today unavailable when the source has nothing for today", () => {
    const s = normalizeHaramainImams(FEED, "madinah", "2026-10-09", "x");
    expect(s.status).toBe("unavailable");
    expect(normalizeHaramainImams(FEED, "madinah", "2026-10-07", "x").status).toBe("available");
  });

  it("exposes the latest earlier name per prayer and role, dated, and never as today's", () => {
    const s = normalizeHaramainImams(FEED, "madinah", "2026-10-07", "x");
    expect(s.prayers.map((p) => p.name)).toEqual(["fajr", "isha"]);
    const dhuhr = s.recent.find((r) => r.name === "dhuhr");
    expect(dhuhr?.imam).toEqual({ date: "2026-10-06", person: expect.objectContaining({ en: "Dr. Abdulbari Awad Al-Thubaity" }) });
    expect(dhuhr?.muezzin).toBeNull();
    // Older than the lookback window is ignored.
    expect(normalizeHaramainImams(FEED, "madinah", "2026-11-30", "x").status).toBe("unavailable");
  });

  it("reports unavailable for unexpected shapes instead of guessing", () => {
    expect(normalizeHaramainImams({ error: "nope" }, "makkah", "2026-10-06", "x").status).toBe("unavailable");
    expect(normalizeHaramainImams([{ date: "2026-10-06", prayer: "fajr", imam: { nameEn: "" , nameAr: "" } }], "makkah", "2026-10-06", "x").status).toBe("unavailable");
  });
});
