"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbJSONStorage } from "@/services/storage/idb-storage";
import { AMAL_BY_ID, SURAH_ITEMS, type AmalCounter } from "@/data/amal/items";
import { amalDayKey, isFridayKey, isOpen, type AmalDay } from "@/features/amal/logic";
import type { LocationId } from "@/config/locations";

/**
 * Daily deeds tracker. Kept only on this device (IndexedDB), one record per Haramain (Riyadh) day.
 * Other features tick items automatically through `markAuto` / `addCount` / `noteQuran`.
 */
type AmalState = {
  days: Record<string, AmalDay>;
  /** First day the tracker was used (stats start here). */
  firstDay: string | null;
  enabled: Record<string, boolean>;
  goals: Record<string, number>;
  /** City whose prayer times decide when each deed opens (kept in sync with the app setting). */
  location: LocationId;
  setLocation: (l: LocationId) => void;
  toggle: (day: string, id: string, now?: number) => void;
  markAuto: (day: string, id: string, now?: number) => void;
  addCount: (day: string, counter: AmalCounter, n?: number) => void;
  setExcused: (day: string, excused: boolean) => void;
  setEnabled: (id: string, on: boolean) => void;
  setGoal: (id: string, goal: number) => void;
  /** Qur'an reader moved to a verse: counts new verses and ticks surah items reaching their last verse. */
  noteQuran: (r: { chapterId: number; ayah: number; verseKey: string }, prevVerseKey: string | null, now?: Date) => void;
  clearAll: () => void;
};

const MAX_DAYS = 800;

function withDay(s: AmalState, day: string, fn: (d: AmalDay) => AmalDay): Pick<AmalState, "days" | "firstDay"> {
  const cur = s.days[day] ?? { done: {} };
  let days = { ...s.days, [day]: fn(cur) };
  const keys = Object.keys(days);
  if (keys.length > MAX_DAYS) {
    keys.sort();
    days = Object.fromEntries(keys.slice(-MAX_DAYS).map((k) => [k, days[k]]));
  }
  return { days, firstDay: !s.firstDay || day < s.firstDay ? day : s.firstDay };
}

export const useAmalStore = create<AmalState>()(
  persist(
    (set, get) => ({
      days: {},
      firstDay: null,
      enabled: {},
      goals: {},
      location: "makkah",
      setLocation: (location) => set({ location }),
      toggle: (day, id, now = Date.now()) => {
        const item = AMAL_BY_ID.get(id);
        const wasDone = Boolean(get().days[day]?.done[id]);
        // A deed whose time hasn't come (later prayer, a future day) can't be ticked yet.
        if (!item || (!wasDone && !isOpen(item, day, new Date(now), get().location))) return;
        set((s) =>
          withDay(s, day, (d) => {
            const done = { ...d.done };
            const auto = { ...(d.auto ?? {}) };
            if (done[id]) {
              delete done[id];
              delete auto[id];
            } else done[id] = now;
            return { ...d, done, auto };
          }),
        );
      },
      markAuto: (day, id, now = Date.now()) => {
        const item = AMAL_BY_ID.get(id);
        if (!item || get().days[day]?.done[id] || !isOpen(item, day, new Date(now), get().location)) return;
        set((s) => withDay(s, day, (d) => ({ ...d, done: { ...d.done, [id]: now }, auto: { ...(d.auto ?? {}), [id]: 1 } })));
      },
      addCount: (day, counter, n = 1) =>
        set((s) => withDay(s, day, (d) => ({ ...d, counts: { ...(d.counts ?? {}), [counter]: Math.max(0, (d.counts?.[counter] ?? 0) + n) } }))),
      setExcused: (day, excused) => set((s) => withDay(s, day, (d) => ({ ...d, excused: excused || undefined }))),
      setEnabled: (id, on) => set((s) => ({ enabled: { ...s.enabled, [id]: on } })),
      setGoal: (id, goal) => set((s) => ({ goals: { ...s.goals, [id]: Math.min(10_000, Math.max(1, Math.round(goal))) } })),
      noteQuran: (r, prevVerseKey, now = new Date()) => {
        const day = amalDayKey(now);
        if (r.verseKey !== prevVerseKey) get().addCount(day, "ayahs", 1);
        for (const it of SURAH_ITEMS) {
          if (it.auto.chapter !== r.chapterId || r.ayah < it.auto.fromAyah) continue;
          if (it.friday && !isFridayKey(day)) continue;
          get().markAuto(day, it.id, now.getTime());
        }
      },
      clearAll: () => set({ days: {}, firstDay: null }),
    }),
    { name: "hc-amal", storage: idbJSONStorage, version: 1, partialize: (s) => ({ days: s.days, firstDay: s.firstDay, enabled: s.enabled, goals: s.goals, location: s.location }) },
  ),
);
