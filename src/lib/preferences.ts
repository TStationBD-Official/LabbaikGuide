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
 * Quran scripts. Every option pairs a typeface with the exact text it was
 * designed for — nothing is ever converted from one script to another:
 *  - QCF (King Fahd Complex page fonts) render the API's glyph codes
 *    (`code_v1` / `code_v2`) with the font of that word's Mushaf page,
 *    reproducing the printed Madinah Mushaf exactly.
 *  - Unicode fonts render `text_qpc_hafs`, `text_uthmani` or `text_indopak`.
 * `family` is also the face used for Arabic outside the reader (duas, adhkar),
 * so QCF options fall back to the matching KFGQPC Unicode font there.
 */
export type QuranTextSource = "text_uthmani" | "text_indopak" | "text_qpc_hafs" | "code_v1" | "code_v2";
export type QcfVersion = "v1" | "v2" | "v4";
export type QuranScriptGroup = "madinah" | "uthmani" | "indopak";
type ScriptDef = {
  family: string;
  script: QuranTextSource;
  group: QuranScriptGroup;
  label: string;
  qcf?: QcfVersion;
};
export const ARABIC_FONTS = {
  qcfV2: { family: "'Quran Hafs'", script: "code_v2", group: "madinah", qcf: "v2", label: "King Fahd Complex — Madinah Mushaf V2" },
  qcfV1: { family: "'Quran Hafs'", script: "code_v1", group: "madinah", qcf: "v1", label: "King Fahd Complex — Madinah Mushaf V1" },
  qcfTajweed: { family: "'Quran Hafs'", script: "code_v2", group: "madinah", qcf: "v4", label: "King Fahd Complex — Tajweed Mushaf V4 (colour-coded)" },
  hafs: { family: "'Quran Hafs'", script: "text_qpc_hafs", group: "madinah", label: "KFGQPC Uthmanic Script Hafs" },
  uthmani: { family: "'Quran Amiri'", script: "text_uthmani", group: "uthmani", label: "Amiri Quran" },
  scheherazade: { family: "'Quran Scheherazade'", script: "text_uthmani", group: "uthmani", label: "Scheherazade New" },
  indopak: { family: "'Quran IndoPak'", script: "text_indopak", group: "indopak", label: "Al-Qalam IndoPak" },
  indopakWaqf: { family: "'Quran IndoPak Nastaleeq'", script: "text_indopak", group: "indopak", label: "IndoPak Nastaleeq (Waqf Lazim)" },
  nastaleeq: { family: "'Quran Nastaliq'", script: "text_indopak", group: "indopak", label: "Noto Nastaliq (Urdu style)" },
  indopakNaskh: { family: "'Quran Naskh'", script: "text_indopak", group: "indopak", label: "Noto Naskh (IndoPak text)" },
} as const satisfies Record<string, ScriptDef>;
export type ArabicFont = keyof typeof ARABIC_FONTS;
export const ARABIC_FONT_GROUPS: QuranScriptGroup[] = ["madinah", "uthmani", "indopak"];
export const scriptDef = (f: ArabicFont): ScriptDef => ARABIC_FONTS[f];
/** The API text field a script needs (QCF codes are word-level; see the server). */
export type QuranScriptField = QuranTextSource;

/** Add the user's 12/24-hour choice to a BCP-47 locale as a Unicode extension (-u-hc-h12 / -u-hc-h23). */
export function withHourCycle(intlLocale: string, timeFormat: "12" | "24"): string {
  return `${intlLocale}-u-hc-${timeFormat === "24" ? "h23" : "h12"}`;
}

/** Add another Unicode extension key (e.g. a calendar) to a locale that may already have "-u-…". */
export function withExtension(intlLocale: string, key: string, value: string): string {
  return intlLocale.includes("-u-") ? `${intlLocale}-${key}-${value}` : `${intlLocale}-u-${key}-${value}`;
}

/** Is this locale (from `useI18n().intlLocale`) set to a 24-hour clock? */
export const is24h = (intlLocale: string) => /-hc-h2[34]/.test(intlLocale);

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
  /** Clock style everywhere in the app, in every language. */
  timeFormat: z.enum(["12", "24"]).catch("12"),
  /** Large screens: navigation drawer collapsed to a rail. */
  navCollapsed: z.boolean().catch(false),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

export const PREFS_COOKIE = "hc_prefs";
export const DEFAULT_PREFERENCES: Preferences = PreferencesSchema.parse({});

/** Parse untrusted cookie content. Always returns valid preferences. */
/**
 * Bump when a default changes and existing users should receive it.
 * v2: Bangla font default → Anek Bangla (saved cookies from v1 carried Noto Sans Bengali).
 */
export const PREFS_VERSION = 2;

export function parsePreferences(raw: string | undefined | null): Preferences {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    if (data.v !== PREFS_VERSION) delete data.banglaFont; // migrate to the new default
    return PreferencesSchema.parse(data);
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function serializePreferences(p: Preferences): string {
  return encodeURIComponent(JSON.stringify({ ...p, v: PREFS_VERSION }));
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
