import { z } from "zod";
import { APP_CONFIG } from "@/config/app";
import { LOCATION_IDS, type LocationId } from "@/config/locations";

/**
 * Appearance preferences are stored in a cookie so the server can render the
 * correct theme, language, direction and fonts on the very first paint —
 * no flash of wrong theme or wrong language.
 */
export const LOCALES = ["bn", "en", "ar", "ur"] as const;
export type Locale = (typeof LOCALES)[number];
export const RTL_LOCALES: readonly Locale[] = ["ar", "ur"];
export const isRtl = (l: Locale) => RTL_LOCALES.includes(l);

export const THEMES = ["system", "light", "dark", "sepia", "mushaf", "contrast"] as const;
export type Theme = (typeof THEMES)[number];

/** Colour themes. "emerald" is the default identity; others override primary/accent tokens. */
export const ACCENTS = ["emerald", "teal", "blue", "indigo", "purple", "rose", "burgundy", "amber", "slate"] as const;
export type Accent = (typeof ACCENTS)[number];
/** Swatch colours for the picker (light-mode primary). */
export const ACCENT_SWATCH: Record<Accent, string> = {
  emerald: "#0f5c45",
  teal: "#0f766e",
  blue: "#1d4ed8",
  indigo: "#4338ca",
  purple: "#7e22ce",
  rose: "#be123c",
  burgundy: "#8b1e3f",
  amber: "#a3530a",
  slate: "#334155",
};

export const BANGLA_FONTS = {
  anek: "'Anek Bangla Variable'",
  noto: "'Noto Sans Bengali'",
  hind: "'Hind Siliguri'",
  baloo: "'Baloo Da 2'",
  tiro: "'Tiro Bangla'",
} as const;
export const BANGLA_FONT_LABEL: Record<keyof typeof BANGLA_FONTS, string> = {
  anek: "Anek Bangla",
  noto: "Noto Sans Bengali",
  hind: "Hind Siliguri",
  baloo: "Baloo Da 2",
  tiro: "Tiro Bangla",
};
export type BanglaFont = keyof typeof BANGLA_FONTS;

/**
 * Arabic/Quran fonts. Each maps to the Quran API script field it must be
 * paired with — IndoPak text comes from `text_indopak`, never converted.
 */
export const ARABIC_FONTS = {
  indopak: { family: "'Quran IndoPak'", script: "text_indopak", label: "IndoPak — Al-Qalam (South Asian Mushaf)" },
  indopakNaskh: { family: "'Quran Naskh'", script: "text_indopak", label: "IndoPak — Naskh (Noto Naskh)" },
  nastaleeq: { family: "'Quran Nastaliq'", script: "text_indopak", label: "IndoPak Nastaleeq (Noto Nastaliq)" },
  hafs: { family: "'Quran Hafs'", script: "text_uthmani", label: "Madinah Mushaf — KFGQPC Uthmanic Hafs" },
  uthmani: { family: "'Quran Amiri'", script: "text_uthmani", label: "Uthmani — Amiri Quran" },
  scheherazade: { family: "'Quran Scheherazade'", script: "text_uthmani", label: "Uthmani Naskh — Scheherazade New" },
} as const;
export type ArabicFont = keyof typeof ARABIC_FONTS;
export type QuranScriptField = (typeof ARABIC_FONTS)[ArabicFont]["script"];

export const FONT_SCALES = [80, 90, 100, 110, 120, 130, 150] as const;

export const PreferencesSchema = z.object({
  locale: z.enum(LOCALES).catch(APP_CONFIG.defaults.locale),
  theme: z.enum(THEMES).catch(APP_CONFIG.defaults.theme),
  accent: z.enum(ACCENTS).catch("emerald"),
  banglaFont: z
    .enum(Object.keys(BANGLA_FONTS) as [BanglaFont, ...BanglaFont[]])
    .catch(APP_CONFIG.defaults.banglaFont),
  arabicFont: z
    .enum(Object.keys(ARABIC_FONTS) as [ArabicFont, ...ArabicFont[]])
    .catch(APP_CONFIG.defaults.arabicFont),
  fontScale: z
    .number()
    .refine((n) => (FONT_SCALES as readonly number[]).includes(n))
    .catch(APP_CONFIG.defaults.fontScale),
  location: z
    .enum(LOCATION_IDS as [LocationId, ...LocationId[]])
    .catch(APP_CONFIG.defaults.location),
  reducedMotion: z.boolean().catch(false),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

export const PREFS_COOKIE = "hc_prefs";
export const DEFAULT_PREFERENCES: Preferences = PreferencesSchema.parse({});

/** Parse untrusted cookie content. Always returns valid preferences. */
export function parsePreferences(raw: string | undefined | null): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    return PreferencesSchema.parse(JSON.parse(decodeURIComponent(raw)));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function serializePreferences(p: Preferences): string {
  return encodeURIComponent(JSON.stringify(p));
}

/** Attributes applied to <html>. Shared by SSR and client updates. */
export function htmlAttributes(p: Preferences) {
  return {
    lang: p.locale,
    dir: isRtl(p.locale) ? "rtl" : "ltr",
    "data-theme": p.theme,
    "data-accent": p.accent,
    "data-bn-font": p.banglaFont,
    "data-ar-font": p.arabicFont,
    "data-reduced-motion": p.reducedMotion ? "true" : "false",
    style: { fontSize: `${p.fontScale}%` },
  } as const;
}
