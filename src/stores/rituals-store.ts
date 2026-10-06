"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  advance,
  back,
  emptyCounter,
  resetCounter,
  setNote,
  undo,
  type RitualCounter,
} from "@/features/manasik/counter";
import { idbJSONStorage } from "@/services/storage/idb-storage";

export type RitualKind = "tawaf" | "sai";
export type HajjType = "tamattu" | "qiran" | "ifrad";

type RitualsState = {
  tawaf: RitualCounter;
  sai: RitualCounter;
  umrahDone: Record<string, boolean>;
  hajjDone: Record<string, boolean>;
  hajjType: HajjType;
  advance: (k: RitualKind) => void;
  back: (k: RitualKind) => void;
  reset: (k: RitualKind) => void;
  undo: (k: RitualKind) => void;
  setNote: (k: RitualKind, n: number, text: string) => void;
  toggleStep: (guide: "umrah" | "hajj", id: string) => void;
  resetGuide: (guide: "umrah" | "hajj") => void;
  setHajjType: (t: HajjType) => void;
};

export const useRitualsStore = create<RitualsState>()(
  persist(
    (set) => ({
      tawaf: emptyCounter(),
      sai: emptyCounter(),
      umrahDone: {},
      hajjDone: {},
      hajjType: "tamattu",
      advance: (k) => set((s) => ({ [k]: advance(s[k]) })),
      back: (k) => set((s) => ({ [k]: back(s[k]) })),
      reset: (k) => set((s) => ({ [k]: resetCounter(s[k]) })),
      undo: (k) => set((s) => ({ [k]: undo(s[k]) })),
      setNote: (k, n, text) => set((s) => ({ [k]: setNote(s[k], n, text) })),
      toggleStep: (guide, id) =>
        set((s) => {
          const key = guide === "umrah" ? "umrahDone" : "hajjDone";
          return { [key]: { ...s[key], [id]: !s[key][id] } };
        }),
      resetGuide: (guide) => set(guide === "umrah" ? { umrahDone: {} } : { hajjDone: {} }),
      setHajjType: (hajjType) => set({ hajjType }),
    }),
    { name: "hc-rituals", storage: idbJSONStorage, version: 1 },
  ),
);
