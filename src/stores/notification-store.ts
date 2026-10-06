"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbJSONStorage } from "@/services/storage/idb-storage";

export type NotificationMode = "all" | "prayer" | "zikr" | "none";

type State = {
  mode: NotificationMode;
  lastZikrReminder: string | null;
  setMode: (m: NotificationMode) => void;
  markZikrReminded: (day: string) => void;
};

export const useNotificationStore = create<State>()(
  persist(
    (set) => ({
      mode: "none",
      lastZikrReminder: null,
      setMode: (mode) => set({ mode }),
      markZikrReminded: (day) => set({ lastZikrReminder: day }),
    }),
    { name: "hc-notifications", storage: idbJSONStorage, version: 1 },
  ),
);
