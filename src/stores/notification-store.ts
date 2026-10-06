"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbJSONStorage } from "@/services/storage/idb-storage";

export type NotificationMode = "all" | "prayer" | "zikr" | "none";

export type PushState = "unknown" | "active" | "disabled" | "unsupported" | "denied" | "error";

type State = {
  mode: NotificationMode;
  lastZikrReminder: string | null;
  /** Background (Web Push) reminders: QStash message ids currently scheduled for this device. */
  pushIds: string[];
  /** tag → scheduled QStash message (so each reminder is published exactly once). */
  pushMap: Record<string, { id: string; at: number }>;
  pushHash: string | null;
  pushSyncedAt: number;
  pushState: PushState;
  setMode: (m: NotificationMode) => void;
  markZikrReminded: (day: string) => void;
  setPush: (p: Partial<Pick<State, "pushIds" | "pushMap" | "pushHash" | "pushSyncedAt" | "pushState">>) => void;
};

export const useNotificationStore = create<State>()(
  persist(
    (set) => ({
      mode: "none",
      lastZikrReminder: null,
      pushIds: [],
      pushMap: {},
      pushHash: null,
      pushSyncedAt: 0,
      pushState: "unknown",
      setMode: (mode) => set({ mode }),
      setPush: (p) => set(p),
      markZikrReminded: (day) => set({ lastZikrReminder: day }),
    }),
    { name: "hc-notifications", storage: idbJSONStorage, version: 1 },
  ),
);
