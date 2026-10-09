"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { idbJSONStorage } from "@/services/storage/idb-storage";
import { EMPTY_TRACK, type Track } from "@/features/places/track";
import type { LocationId } from "@/config/locations";

/**
 * Saved walks (recorded paths with their waypoints), and the walk being recorded now.
 * Stored only on this device (IndexedDB) — never sent to our server.
 */
export type SavedWalk = {
  id: string;
  name: string;
  note?: string;
  loc: LocationId;
  /** Waypoints: [lon, lat, time ms]. */
  points: [number, number, number][];
  /** Distance walked (m). */
  walked: number;
  /** Recording time without pauses (ms). */
  activeMs: number;
  createdAt: number;
  updatedAt: number;
};

type WalksState = {
  walks: SavedWalk[];
  /** The recording in progress (survives refreshes). */
  current: Track;
  setCurrent: (fn: (t: Track) => Track) => void;
  /** Save the current recording under a name; returns the new walk's id. */
  saveCurrent: (name: string, loc: LocationId, now: number) => string | null;
  update: (id: string, patch: { name?: string; note?: string }) => void;
  remove: (id: string) => void;
};

const MAX_WALKS = 50;
const clean = (s: string | undefined, max: number) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export const useWalksStore = create<WalksState>()(
  persist(
    (set, get) => ({
      walks: [],
      current: EMPTY_TRACK,
      setCurrent: (fn) => set((s) => ({ current: fn(s.current) })),
      saveCurrent: (name, loc, now) => {
        const c = get().current;
        if (c.points.length < 2) return null;
        const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(now);
        const activeMs = c.activeMs + (c.on && c.resumedAt !== null ? Math.max(0, now - c.resumedAt) : 0);
        const walk: SavedWalk = {
          id,
          name: clean(name, 60) || "—",
          loc,
          points: c.points,
          walked: Math.round(c.walked),
          activeMs,
          createdAt: c.points[0][2],
          updatedAt: now,
        };
        set((s) => ({ walks: [walk, ...s.walks].slice(0, MAX_WALKS), current: EMPTY_TRACK }));
        return id;
      },
      update: (id, patch) =>
        set((s) => ({
          walks: s.walks.map((w) =>
            w.id === id
              ? {
                  ...w,
                  name: patch.name !== undefined ? clean(patch.name, 60) || w.name : w.name,
                  note: patch.note !== undefined ? clean(patch.note, 300) || undefined : w.note,
                  updatedAt: Date.now(),
                }
              : w,
          ),
        })),
      remove: (id) => set((s) => ({ walks: s.walks.filter((w) => w.id !== id) })),
    }),
    { name: "hc-walks", storage: idbJSONStorage, version: 1 },
  ),
);
