"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbJSONStorage } from "@/services/storage/idb-storage";
import { isValidTimeZone } from "@/features/clock/timezones";

type State = {
  /** Show the home-country clock next to Makkah time. */
  showHome: boolean;
  /** IANA time zone of the user's home country — not set until the user chooses. */
  homeTz: string | null;
  setShowHome: (v: boolean) => void;
  setHomeTz: (tz: string) => void;
};

export const useClockStore = create<State>()(
  persist(
    (set) => ({
      showHome: true,
      homeTz: null,
      setShowHome: (showHome) => set({ showHome }),
      setHomeTz: (tz) => {
        if (isValidTimeZone(tz)) set({ homeTz: tz });
      },
    }),
    { name: "hc-clock", storage: idbJSONStorage, version: 2, migrate: () => ({ showHome: true, homeTz: null }) },
  ),
);
