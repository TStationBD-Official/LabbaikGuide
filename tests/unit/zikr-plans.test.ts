import { beforeEach, describe, expect, it } from "vitest";
import { computeReminders, makkahTime, remindersHash } from "@/features/zikr/reminders";
import { calculatePrayerDay } from "@/features/prayer/times";
import { AFTER_SALAH_ITEMS, ZIKR_CATALOG } from "@/data/zikr/after-salah";
import { builtInPlan, progressKey, usePlanStore, type ZikrPlan } from "@/stores/zikr-plan-store";

const DAY = { year: 2026, month: 10, day: 6 };
const title = (p: ZikrPlan, s: string | null) => `${p.id}:${s}`;
const body = () => "b";

describe("after-salah catalog", () => {
  it("every plan item refers to a known zikr", () => {
    const ids = new Set(ZIKR_CATALOG.map((z) => z.id));
    expect(AFTER_SALAH_ITEMS.every((i) => ids.has(i.zikrId))).toBe(true);
    // Ayat al-Kursi is linked to the Quran reader, never re-typed.
    const kursi = ZIKR_CATALOG.find((z) => z.id === "ayatul-kursi")!;
    expect(kursi.arabic).toBe("");
    expect(kursi.link).toBe("/quran/surah/2?ayah=255");
  });
});

describe("computeReminders", () => {
  it("schedules each built-in plan at adhan + offset, skipping past and completed ones", () => {
    const fajr = calculatePrayerDay("makkah", DAY).prayers.find((p) => p.name === "fajr")!.adhan.getTime();
    const plans = [builtInPlan("fajr"), builtInPlan("dhuhr")];
    const now = fajr - 60_000; // just before Fajr
    const r = computeReminders({ plans, location: "makkah", now, days: 1, title, body });
    expect(r.map((x) => x.planId)).toEqual(["salah-fajr", "salah-dhuhr"]);
    expect(r[0].at).toBe(fajr + 35 * 60_000);
    expect(r[0].url).toBe("/zikr?plan=salah-fajr");
    const done = computeReminders({ plans, location: "makkah", now, days: 1, title, body, done: (id) => id === "salah-fajr" });
    expect(done.map((x) => x.planId)).toEqual(["salah-dhuhr"]);
    const later = computeReminders({ plans, location: "makkah", now: fajr + 36 * 60_000, days: 1, title, body });
    expect(later.map((x) => x.planId)).toEqual(["salah-dhuhr"]);
  });

  it("supports fixed Makkah times and multi-prayer custom plans; respects remind=false", () => {
    const at = makkahTime(DAY, "21:30");
    expect(new Date(at).toISOString()).toBe("2026-10-06T18:30:00.000Z");
    const plans: ZikrPlan[] = [
      { id: "p1", builtIn: false, name: "Night", trigger: { type: "time", time: "21:30" }, items: [{ zikrId: "subhanallah", count: 10 }], remind: true },
      { id: "p2", builtIn: false, trigger: { type: "salah", salah: ["asr", "isha"], offsetMin: 5 }, items: [{ zikrId: "subhanallah", count: 10 }], remind: true },
      { ...builtInPlan("maghrib"), remind: false },
    ];
    const r = computeReminders({ plans, location: "makkah", now: Date.UTC(2026, 9, 6, 3), days: 2, title, body });
    expect(r.filter((x) => x.planId === "p1")).toHaveLength(2);
    expect(r.filter((x) => x.planId === "p2")).toHaveLength(4);
    expect(r.some((x) => x.planId === "salah-maghrib")).toBe(false);
    expect([...r].sort((a, b) => a.at - b.at)).toEqual(r);
    expect(new Set(r.map((x) => x.tag)).size).toBe(r.length);
    expect(remindersHash(r)).toBe(remindersHash([...r]));
  });
});

describe("plan store", () => {
  beforeEach(() => usePlanStore.setState({ plans: [builtInPlan("fajr")], progress: {} }));
  const day = "2026-10-06";

  it("counts through steps, then completes the plan", () => {
    const { tap, skip } = usePlanStore.getState();
    const id = "salah-fajr";
    expect(tap(id, day)).toBe("counted");
    expect(tap(id, day)).toBe("counted");
    expect(tap(id, day)).toBe("step-done"); // astaghfirullah ×3
    skip(id, day);
    expect(usePlanStore.getState().progress[progressKey(id, day)]).toMatchObject({ step: 1, count: 0 });
    // Walk the remaining steps.
    for (let s = 1; s < AFTER_SALAH_ITEMS.length; s++) {
      let r = "";
      for (let i = 0; i < AFTER_SALAH_ITEMS[s].count; i++) r = tap(id, day);
      if (s < AFTER_SALAH_ITEMS.length - 1) {
        expect(r).toBe("step-done");
        skip(id, day);
      } else expect(r).toBe("plan-done");
    }
    expect(usePlanStore.getState().progress[progressKey(id, day)].done).toBe(true);
    expect(tap(id, day)).toBe("ignored");
  });

  it("supports undo, back and restart", () => {
    const { tap, undoTap, back, restart, skip } = usePlanStore.getState();
    const id = "salah-fajr";
    tap(id, day);
    undoTap(id, day);
    expect(usePlanStore.getState().progress[progressKey(id, day)].count).toBe(0);
    skip(id, day);
    back(id, day);
    expect(usePlanStore.getState().progress[progressKey(id, day)]).toMatchObject({ step: 0, count: 0 });
    restart(id, day);
    expect(usePlanStore.getState().progress[progressKey(id, day)]).toMatchObject({ step: 0, done: false });
  });

  it("validates and saves custom plans; built-ins keep their trigger but allow a new offset", () => {
    const { savePlan, deletePlan } = usePlanStore.getState();
    expect(() => savePlan({ name: "x", trigger: { type: "time", time: "25:00" }, items: [{ zikrId: "subhanallah", count: 5 }], remind: true })).toThrow();
    expect(() => savePlan({ name: "x", trigger: { type: "time", time: "05:00" }, items: [], remind: true })).toThrow();
    const id = savePlan({ name: "  Morning ", trigger: { type: "time", time: "05:00" }, items: [{ zikrId: "subhanallah", count: 0 }], remind: true });
    const p = usePlanStore.getState().plans.find((x) => x.id === id)!;
    expect(p).toMatchObject({ name: "Morning", builtIn: false });
    expect(p.items[0].count).toBe(1);
    savePlan({ id: "salah-fajr", trigger: { type: "time", time: "01:00" }, items: [{ zikrId: "subhanallah", count: 3 }], remind: false });
    const f = usePlanStore.getState().plans.find((x) => x.id === "salah-fajr")!;
    expect(f.trigger).toEqual({ type: "salah", salah: ["fajr"], offsetMin: 35 });
    deletePlan("salah-fajr"); // built-ins cannot be deleted
    expect(usePlanStore.getState().plans.some((x) => x.id === "salah-fajr")).toBe(true);
    deletePlan(id);
    expect(usePlanStore.getState().plans.some((x) => x.id === id)).toBe(false);
  });
});
