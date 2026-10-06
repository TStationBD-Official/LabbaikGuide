"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_ZIKR } from "@/data/zikr/defaults";
import {
  applyIncrement,
  applyReset,
  applyUndo,
  localDayKey,
  moveItem,
  type CustomZikrInput,
  type DailyHistory,
  type UndoEntry,
  type ZikrCounts,
} from "@/features/zikr/logic";
import { idbJSONStorage } from "@/services/storage/idb-storage";
import type { Zikr } from "@/types/content";
import { uid } from "@/lib/utils";

type ZikrState = {
  activeId: string;
  counts: ZikrCounts;
  targets: Record<string, number>;
  custom: Zikr[];
  order: string[];
  history: DailyHistory;
  /** In-memory only: undo does not survive reloads by design. */
  undo: UndoEntry[];
  /** When a target is reached, vibrate and move on to the next unfinished zikr. */
  autoAdvance: boolean;
  setAutoAdvance: (v: boolean) => void;
  /** Vibrate on taps and on reaching the target. */
  haptics: boolean;
  setHaptics: (v: boolean) => void;
  setActive: (id: string) => void;
  increment: (id: string) => void;
  reset: (id: string) => void;
  undoLast: (id?: string) => boolean;
  setTarget: (id: string, target: number) => void;
  addCustom: (input: CustomZikrInput) => string;
  updateCustom: (id: string, input: CustomZikrInput) => void;
  deleteCustom: (id: string) => void;
  duplicate: (id: string) => string | null;
  move: (id: string, dir: -1 | 1) => void;
};

const customToZikr = (id: string, i: CustomZikrInput): Zikr => ({
  id,
  kind: "custom",
  name: i.name,
  arabic: i.arabic,
  pronunciation: i.pronunciation,
  meaning: i.meaning,
  target: i.target,
});

export const useZikrStore = create<ZikrState>()(
  persist(
    (set, get) => ({
      activeId: DEFAULT_ZIKR[0].id,
      counts: {},
      targets: {},
      custom: [],
      order: DEFAULT_ZIKR.map((z) => z.id),
      history: {},
      autoAdvance: true,
      setAutoAdvance: (v) => set({ autoAdvance: v }),
      haptics: true,
      setHaptics: (v) => set({ haptics: v }),
      undo: [],
      setActive: (activeId) => set({ activeId }),
      increment: (id) =>
        set((s) => applyIncrement(s.counts, s.history, s.undo, id, localDayKey(new Date()))),
      reset: (id) => set((s) => applyReset(s.counts, s.undo, id)),
      undoLast: (id) => {
        const s = get();
        const r = applyUndo(s.counts, s.history, s.undo, id);
        if (r.undone) set({ counts: r.counts, history: r.history, undo: r.undo });
        return r.undone;
      },
      setTarget: (id, target) => set((s) => ({ targets: { ...s.targets, [id]: target } })),
      addCustom: (input) => {
        const id = `custom-${uid()}`;
        set((s) => ({ custom: [...s.custom, customToZikr(id, input)], order: [...s.order, id], activeId: id }));
        return id;
      },
      updateCustom: (id, input) =>
        set((s) => ({ custom: s.custom.map((z) => (z.id === id ? customToZikr(id, input) : z)) })),
      deleteCustom: (id) =>
        set((s) => {
          const { [id]: _c, ...counts } = s.counts;
          void _c;
          return {
            custom: s.custom.filter((z) => z.id !== id),
            order: s.order.filter((x) => x !== id),
            counts,
            undo: s.undo.filter((u) => u.id !== id),
            activeId: s.activeId === id ? DEFAULT_ZIKR[0].id : s.activeId,
          };
        }),
      duplicate: (id) => {
        const s = get();
        const src = [...DEFAULT_ZIKR, ...s.custom].find((z) => z.id === id);
        if (!src) return null;
        const text = (v: Zikr["name"]) => (typeof v === "string" ? v : v.bn);
        return get().addCustom({
          name: `${text(src.name)} (2)`.slice(0, 80),
          arabic: src.arabic,
          pronunciation: text(src.pronunciation),
          meaning: text(src.meaning),
          target: s.targets[id] ?? src.target,
        });
      },
      move: (id, dir) =>
        set((s) => {
          const i = s.order.indexOf(id);
          return { order: moveItem(s.order, i, i + dir) };
        }),
    }),
    {
      name: "hc-zikr",
      storage: idbJSONStorage,
      version: 1,
      partialize: (s) => ({
        activeId: s.activeId,
        counts: s.counts,
        targets: s.targets,
        custom: s.custom,
        order: s.order,
        history: s.history,
        autoAdvance: s.autoAdvance,
        haptics: s.haptics,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ZikrState>;
        const merged = { ...current, ...p };
        // Ensure newly shipped default zikr appear for existing users.
        const known = new Set(merged.order);
        merged.order = [...merged.order, ...DEFAULT_ZIKR.map((z) => z.id).filter((id) => !known.has(id))];
        return merged;
      },
    },
  ),
);

export function useAllZikr(): Zikr[] {
  const custom = useZikrStore((s) => s.custom);
  const order = useZikrStore((s) => s.order);
  const map = new Map<string, Zikr>([...DEFAULT_ZIKR, ...custom].map((z) => [z.id, z]));
  return order.map((id) => map.get(id)).filter((z): z is Zikr => Boolean(z));
}
