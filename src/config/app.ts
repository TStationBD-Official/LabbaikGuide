/**
 * Central application configuration.
 * Never hard-code production endpoints elsewhere — import from here.
 * Server-only values live in `src/config/server.ts`.
 */
export const APP_CONFIG = {
  name: "Haramain Companion",
  shortName: "Haramain",
  description:
    "A trustworthy Umrah & Hajj companion: Quran with Bangla translation and Tafsir, zikr counter, Umrah and Hajj guides, duas and Haram prayer times.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  defaults: {
    locale: "bn",
    theme: "system",
    banglaFont: "noto",
    arabicFont: "indopak",
    fontScale: 100,
    location: "makkah",
  },
  cache: {
    /** Quran text never changes; translations rarely. */
    quranStaleMs: 1000 * 60 * 60 * 24 * 7,
    quranGcMs: 1000 * 60 * 60 * 24 * 30,
    /** Haramain schedules are time-sensitive. */
    scheduleStaleMs: 1000 * 60 * 15,
    persistMaxAgeMs: 1000 * 60 * 60 * 24 * 30,
  },
  prayer: {
    refreshIntervalMs: 1000 * 60 * 15,
    /** Minutes after adhan during which a prayer is shown as "now". */
    prayerNowWindowMin: 15,
    /** Clock skew (ms) above which we warn about the device clock. */
    clockSkewWarnMs: 1000 * 90,
  },
  quran: {
    versesPerPage: 10,
    defaultRecitationId: 7,
    audioBaseUrl: "https://verses.quran.com/",
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
    notifications: true,
    audio: true,
    wordByWord: true,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
