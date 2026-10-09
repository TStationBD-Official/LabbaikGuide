import { beforeEach, describe, expect, it } from "vitest";
import { AMAL_ITEMS, AMAL_BY_ID } from "@/data/amal/items";
import {
  amalDayKey,
  isOpen,
  opensAt,
  fardStreak,
  isFridayKey,
  itemsFor,
  kindBreakdown,
  rangeScores,
  recommend,
  scoreDay,
  shiftKey,
  summarize,
  trackedKeys,
  type AmalDay,
  type AmalSettings,
} from "@/features/amal/logic";
import { useAmalStore } from "@/stores/amal-store";

const S: AmalSettings = { enabled: {}, goals: {} };
const THU = "2026-10-08";
const FRI = "2026-10-09";
const fards = ["fajr-fard", "dhuhr-fard", "asr-fard", "maghrib-fard", "isha-fard"];
const dayWith = (ids: string[], extra: Partial<AmalDay> = {}): AmalDay => ({ done: Object.fromEntries(ids.map((i) => [i, 1])), ...extra });

describe("amal catalog", () => {
  it("has unique ids, sources for everything and five fard prayers", () => {
    expect(new Set(AMAL_ITEMS.map((i) => i.id)).size).toBe(AMAL_ITEMS.length);
    for (const i of AMAL_ITEMS) {
      expect(i.refs.length, i.id).toBeGreaterThan(0);
      expect(i.title.en && i.title.bn && i.title.ur, i.id).toBeTruthy();
      expect(i.virtue.en && i.virtue.bn && i.virtue.ur, i.id).toBeTruthy();
      for (const r of i.refs) if (r.url) expect(r.url).toMatch(/^https:\/\//);
    }
    expect(AMAL_ITEMS.filter((i) => i.kind === "fard").map((i) => i.id)).toEqual(fards);
  });
  it("marks Ya-Sin as a weak narration", () => {
    expect(AMAL_BY_ID.get("yasin")?.grade).toBe("weak");
  });
});

describe("days", () => {
  it("uses the Riyadh date", () => {
    expect(amalDayKey(new Date("2026-10-08T21:30:00Z"))).toBe("2026-10-09"); // 00:30 in Makkah
    expect(isFridayKey(FRI)).toBe(true);
    expect(shiftKey(FRI, 1)).toBe("2026-10-10");
    expect(shiftKey("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("shows Friday items only on Friday and hides the Friday-replaced sunnah", () => {
    const fri = itemsFor(FRI, S).map((i) => i.id);
    const thu = itemsFor(THU, S).map((i) => i.id);
    expect(fri).toContain("kahf");
    expect(thu).not.toContain("kahf");
    expect(thu).toContain("dhuhr-sunnah-before");
    expect(fri).not.toContain("dhuhr-sunnah-before");
  });
  it("respects settings, but fard can't be switched off", () => {
    const off = itemsFor(THU, { enabled: { "fajr-fard": false, duha: false, sajdah: true }, goals: {} }).map((i) => i.id);
    expect(off).toContain("fajr-fard");
    expect(off).not.toContain("duha");
    expect(off).toContain("sajdah");
    expect(itemsFor(THU, S).map((i) => i.id)).not.toContain("sajdah"); // optional = off by default
  });
});

describe("scoring", () => {
  it("weights fard most and counts goals", () => {
    const empty = scoreDay(THU, undefined, S);
    expect(empty.pct).toBe(0);
    const f = scoreDay(THU, dayWith(fards), S);
    expect(f.fardDone).toBe(5);
    expect(f.pct).toBeGreaterThan(0.3);
    const counted = scoreDay(THU, { done: {}, counts: { istighfar: 100 } }, S);
    expect(counted.doneItems).toBe(1);
    const lower = scoreDay(THU, { done: {}, counts: { istighfar: 50 } }, { enabled: {}, goals: { istighfar: 50 } });
    expect(lower.doneItems).toBe(1);
  });
  it("leaves prayer items out on an excused day", () => {
    const sc = scoreDay(THU, { done: {}, excused: true }, S);
    expect(sc.fardTotal).toBe(0);
    expect(sc.totalItems).toBeGreaterThan(0);
  });
  it("all items done → 100%", () => {
    const all = itemsFor(FRI, S).map((i) => i.id);
    expect(scoreDay(FRI, dayWith(all), S).pct).toBe(1);
  });
});

describe("ranges, streaks, breakdown", () => {
  const days: Record<string, AmalDay> = {
    "2026-10-05": dayWith(fards),
    "2026-10-06": dayWith(fards),
    "2026-10-07": dayWith(fards.slice(0, 3)),
    "2026-10-08": dayWith(fards),
    "2026-10-09": dayWith(fards),
  };
  it("returns null before the first day and in the future", () => {
    const r = rangeScores(days, S, "2026-10-04", "2026-10-10", FRI, "2026-10-05");
    expect(r[0]).toBeNull();
    expect(r.at(-1)).toBeNull();
    expect(summarize(r).days).toBe(5);
  });
  it("counts the fard streak and the best run", () => {
    expect(fardStreak(days, S, FRI)).toEqual({ current: 2, best: 2 });
  });
  it("tracked days without a record count as missed", () => {
    expect(trackedKeys("2026-10-01", "2026-10-12", FRI, "2026-10-05")).toHaveLength(5);
    const k = kindBreakdown({}, S, ["2026-10-08"]);
    expect(k.find((x) => x.kind === "fard")).toEqual({ kind: "fard", done: 0, total: 5 });
  });
  it("recommends the most-missed fard first and Kahf on Friday", () => {
    const rec = recommend(days, S, FRI, "2026-10-05", 3);
    expect(rec[0]).toMatchObject({ type: "fard" });
    expect(rec.some((r) => r.type === "kahf")).toBe(true);
    expect(recommend({}, S, THU, null)[0].type).toBe("start");
  });
});

describe("time windows", () => {
  const noon = new Date("2026-10-09T09:30:00Z"); // 12:30 in Makkah, Friday
  const item = (id: string) => AMAL_BY_ID.get(id)!;
  it("opens prayer items at their adhan and night items after Maghrib/Isha", () => {
    expect(isOpen(item("fajr-fard"), FRI, noon, "makkah")).toBe(true);
    expect(isOpen(item("dhuhr-fard"), FRI, noon, "makkah")).toBe(true);
    expect(isOpen(item("asr-fard"), FRI, noon, "makkah")).toBe(false);
    expect(isOpen(item("maghrib-sunnah-after"), FRI, noon, "makkah")).toBe(false);
    expect(isOpen(item("witr"), FRI, noon, "makkah")).toBe(false);
    expect(isOpen(item("mulk"), FRI, noon, "makkah")).toBe(false);
    expect(isOpen(item("istighfar"), FRI, noon, "makkah")).toBe(true);
    const asr = opensAt(item("asr-fard"), FRI, "makkah")!;
    expect(asr.getTime()).toBeGreaterThan(noon.getTime());
    expect(isOpen(item("asr-fard"), FRI, new Date(asr.getTime() + 1000), "makkah")).toBe(true);
  });
  it("past days are open, future days closed; Duha opens after sunrise", () => {
    expect(isOpen(item("isha-fard"), THU, noon, "makkah")).toBe(true);
    expect(isOpen(item("fajr-fard"), "2026-10-10", noon, "makkah")).toBe(false);
    const sunriseish = new Date("2026-10-09T03:16:00Z"); // ≈ 06:16 Makkah, just after sunrise
    expect(isOpen(item("duha"), FRI, sunriseish, "makkah")).toBe(false);
  });
});

describe("amal store", () => {
  beforeEach(() => useAmalStore.setState({ days: {}, firstDay: null, enabled: {}, goals: {} }));
  it("won't tick a deed whose time hasn't come", () => {
    const tomorrow = shiftKey(amalDayKey(), 1);
    useAmalStore.getState().toggle(tomorrow, "fajr-fard");
    expect(useAmalStore.getState().days[tomorrow]).toBeUndefined();
  });
  it("toggles, auto-marks once and counts", () => {
    const st = useAmalStore.getState();
    const T = Date.parse("2026-10-09T09:00:00Z");
    st.toggle(THU, "fajr-fard", T);
    expect(useAmalStore.getState().days[THU].done["fajr-fard"]).toBe(T);
    expect(useAmalStore.getState().firstDay).toBe(THU);
    st.toggle(THU, "fajr-fard");
    expect(useAmalStore.getState().days[THU].done["fajr-fard"]).toBeUndefined();
    st.markAuto(THU, "fajr-adhkar", T + 7);
    st.markAuto(THU, "fajr-adhkar", T + 9);
    expect(useAmalStore.getState().days[THU].done["fajr-adhkar"]).toBe(T + 7);
    expect(useAmalStore.getState().days[THU].auto?.["fajr-adhkar"]).toBe(1);
    st.markAuto(THU, "not-an-item");
    expect(useAmalStore.getState().days[THU].done["not-an-item"]).toBeUndefined();
    st.addCount(THU, "istighfar", 3);
    expect(useAmalStore.getState().days[THU].counts?.istighfar).toBe(3);
  });
  it("Qur'an reading: new verses count, surah end ticks, Kahf only on Friday", () => {
    const fri = new Date("2026-10-09T17:30:00Z"); // 20:30 in Makkah, after Maghrib
    const thu = new Date("2026-10-08T09:00:00Z");
    const st = useAmalStore.getState();
    st.noteQuran({ chapterId: 67, ayah: 29, verseKey: "67:29" }, null, fri);
    st.noteQuran({ chapterId: 67, ayah: 29, verseKey: "67:29" }, "67:29", fri);
    expect(useAmalStore.getState().days[FRI].counts?.ayahs).toBe(1);
    expect(useAmalStore.getState().days[FRI].done.mulk).toBeUndefined();
    st.noteQuran({ chapterId: 67, ayah: 30, verseKey: "67:30" }, "67:29", fri);
    expect(useAmalStore.getState().days[FRI].done.mulk).toBeTruthy();
    st.noteQuran({ chapterId: 18, ayah: 110, verseKey: "18:110" }, null, thu);
    expect(useAmalStore.getState().days[THU].done.kahf).toBeUndefined();
    st.noteQuran({ chapterId: 18, ayah: 110, verseKey: "18:110" }, null, fri);
    expect(useAmalStore.getState().days[FRI].done.kahf).toBeTruthy();
  });
});

describe("today counts only what is due", () => {
  it("at 12:30 on Friday, Asr/Maghrib/Isha and the night aren't counted yet", () => {
    const S2: AmalSettings = { enabled: {}, goals: {} };
    const due = { now: new Date("2026-10-09T09:30:00Z"), location: "makkah" as const };
    const all = scoreDay(FRI, undefined, S2);
    const soFar = scoreDay(FRI, undefined, S2, undefined, due);
    expect(soFar.totalItems).toBeLessThan(all.totalItems);
    expect(soFar.fardTotal).toBe(2); // Fajr and Jumu'ah/Dhuhr
    const two = scoreDay(FRI, dayWith(["fajr-fard", "dhuhr-fard"]), S2, undefined, due);
    expect(two.fardDone).toBe(2);
    expect(two.pct).toBeGreaterThan(all.totalWeight ? 20 / all.totalWeight : 0);
  });
});
