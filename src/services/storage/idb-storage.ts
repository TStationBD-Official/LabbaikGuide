import { createStore, del, get, set, clear, type UseStore } from "idb-keyval";
import { createJSONStorage, type StateStorage } from "zustand/middleware";

/**
 * IndexedDB-backed storage for local-first data (zikr history, bookmarks,
 * favourites, progress). Falls back to an in-memory map when IndexedDB is
 * unavailable (private mode, very old browsers) so the app keeps working.
 */
let idbStore: UseStore | null = null;
const memory = new Map<string, string>();

function getIdb(): UseStore | null {
  if (typeof indexedDB === "undefined") return null;
  if (!idbStore) {
    try {
      idbStore = createStore("haramain-companion", "kv");
    } catch {
      return null;
    }
  }
  return idbStore;
}

export const idbStateStorage: StateStorage<Promise<void>> & {
  getItem: (name: string) => Promise<string | null>;
} = {
  getItem: async (name) => {
    const s = getIdb();
    if (!s) return memory.get(name) ?? null;
    try {
      return (await get<string>(name, s)) ?? null;
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem: async (name, value) => {
    memory.set(name, value);
    const s = getIdb();
    if (!s) return;
    try {
      await set(name, value, s);
    } catch {
      /* quota or private mode: memory copy keeps the session working */
    }
  },
  removeItem: async (name) => {
    memory.delete(name);
    const s = getIdb();
    if (s) await del(name, s).catch(() => undefined);
  },
};

export const idbJSONStorage = createJSONStorage(() => idbStateStorage);

export async function clearAllLocalData() {
  memory.clear();
  const s = getIdb();
  if (s) await clear(s).catch(() => undefined);
  if ("caches" in globalThis) {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("hc-")).map((k) => caches.delete(k)));
  }
}
