"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type PersistApi = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
};

/** True once a zustand `persist` store has loaded from IndexedDB. */
export function useStoreHydrated(store: PersistApi): boolean {
  return useSyncExternalStore(
    (cb) => store.persist.onFinishHydration(cb),
    () => store.persist.hasHydrated(),
    () => false,
  );
}

/** True after the first client render — guards browser-only APIs. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time mount flag
  useEffect(() => setMounted(true), []);
  return mounted;
}
