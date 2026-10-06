"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import type { Preferences } from "@/lib/preferences";
import {
  createPreferencesStore,
  type PreferencesState,
  type PreferencesStore,
} from "@/stores/preferences-store";

const PreferencesContext = createContext<PreferencesStore | null>(null);

export function PreferencesProvider({
  initial,
  children,
}: {
  initial: Preferences;
  children: ReactNode;
}) {
  const [store] = useState(() => createPreferencesStore(initial));
  return <PreferencesContext.Provider value={store}>{children}</PreferencesContext.Provider>;
}

export function usePrefs<T>(selector: (s: PreferencesState) => T): T {
  const store = useContext(PreferencesContext);
  if (!store) throw new Error("usePrefs must be used inside <PreferencesProvider>");
  return useStore(store, selector);
}
