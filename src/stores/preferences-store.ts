import { createStore } from "zustand/vanilla";
import {
  htmlAttributes,
  PREFS_COOKIE,
  PreferencesSchema,
  serializePreferences,
  type Preferences,
} from "@/lib/preferences";

export type PreferencesState = Preferences & {
  set: (patch: Partial<Preferences>) => void;
};

const ONE_YEAR = 60 * 60 * 24 * 365;

function persist(p: Preferences) {
  if (typeof document === "undefined") return;
  document.cookie = `${PREFS_COOKIE}=${serializePreferences(p)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  const attrs = htmlAttributes(p);
  const root = document.documentElement;
  root.lang = attrs.lang;
  root.dir = attrs.dir;
  root.dataset.theme = attrs["data-theme"];
  root.dataset.accent = attrs["data-accent"];
  root.dataset.bnFont = attrs["data-bn-font"];
  root.dataset.arFont = attrs["data-ar-font"];
  root.dataset.reducedMotion = attrs["data-reduced-motion"];
  root.style.fontSize = attrs.style.fontSize;
}

/**
 * Appearance preferences: one store per request/app instance (SSR-safe).
 * Source of truth is the cookie so the server renders the right theme/language.
 */
export const createPreferencesStore = (initial: Preferences) =>
  createStore<PreferencesState>()((set, get) => ({
    ...initial,
    set: (patch) => {
      const { set: _ignored, ...current } = get();
      void _ignored;
      const next = PreferencesSchema.parse({ ...current, ...patch });
      persist(next);
      set(next);
    },
  }));

export type PreferencesStore = ReturnType<typeof createPreferencesStore>;
