"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbJSONStorage } from "@/services/storage/idb-storage";

type FavoritesState = {
  duas: string[];
  toggleDua: (id: string) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      duas: [],
      toggleDua: (id) =>
        set((s) => ({ duas: s.duas.includes(id) ? s.duas.filter((x) => x !== id) : [id, ...s.duas] })),
    }),
    { name: "hc-favorites", storage: idbJSONStorage, version: 1 },
  ),
);
