"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbJSONStorage } from "@/services/storage/idb-storage";
import { isValidLatLon } from "@/features/places/geo";

/**
 * Saved places (hotel and other meeting points). Stored only on this device
 * (IndexedDB) — locations are never sent to our server.
 */
export type PlaceKind = "hotel" | "meeting" | "other";
export type Place = {
  id: string;
  kind: PlaceKind;
  name: string;
  lat: number;
  lon: number;
  /** Accuracy in metres of the saved position (null when placed by hand). */
  accuracy: number | null;
  source: "gps" | "map" | "link";
  room?: string;
  phone?: string;
  note?: string;
  savedAt: number;
  updatedAt: number;
};

type PlacesState = {
  places: Place[];
  activeId: string | null;
  add: (p: Omit<Place, "id" | "savedAt" | "updatedAt">) => string;
  update: (id: string, patch: Partial<Omit<Place, "id" | "savedAt">>) => void;
  remove: (id: string) => void;
  setActive: (id: string) => void;
};

const MAX_PLACES = 20;
const clean = (s: string | undefined, max: number) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max) || undefined;

export const usePlacesStore = create<PlacesState>()(
  persist(
    (set, get) => ({
      places: [],
      activeId: null,
      add: (p) => {
        if (!isValidLatLon(p.lat, p.lon)) throw new Error("invalid coordinates");
        const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
        const now = Date.now();
        const place: Place = {
          ...p,
          id,
          name: clean(p.name, 80) ?? "",
          room: clean(p.room, 30),
          phone: clean(p.phone, 30),
          note: clean(p.note, 300),
          savedAt: now,
          updatedAt: now,
        };
        set((s) => ({ places: [place, ...s.places].slice(0, MAX_PLACES), activeId: id }));
        return id;
      },
      update: (id, patch) => {
        if (patch.lat !== undefined && patch.lon !== undefined && !isValidLatLon(patch.lat, patch.lon)) return;
        set((s) => ({
          places: s.places.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...patch,
                  name: patch.name !== undefined ? (clean(patch.name, 80) ?? "") : p.name,
                  room: patch.room !== undefined ? clean(patch.room, 30) : p.room,
                  phone: patch.phone !== undefined ? clean(patch.phone, 30) : p.phone,
                  note: patch.note !== undefined ? clean(patch.note, 300) : p.note,
                  updatedAt: Date.now(),
                }
              : p,
          ),
        }));
      },
      remove: (id) =>
        set((s) => {
          const places = s.places.filter((p) => p.id !== id);
          return { places, activeId: s.activeId === id ? (places[0]?.id ?? null) : s.activeId };
        }),
      setActive: (id) => {
        if (get().places.some((p) => p.id === id)) set({ activeId: id });
      },
    }),
    { name: "hc-places", storage: idbJSONStorage, version: 1 },
  ),
);

export function useActivePlace(): Place | null {
  return usePlacesStore((s) => s.places.find((p) => p.id === s.activeId) ?? s.places[0] ?? null);
}
