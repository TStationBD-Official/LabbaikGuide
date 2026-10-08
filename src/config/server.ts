import "server-only";

/**
 * Server-only configuration. These values must never reach the browser bundle.
 * `server-only` makes the build fail if a client component imports this file.
 */
export const SERVER_CONFIG = {
  about: {
    /** TPanel public API (company profile + published apps). */
    apiBase: process.env.ABOUT_API_BASE ?? "https://tpanel-web.vercel.app",
    /** Data is re-checked at most this often; edits in the panel show up within this window. */
    revalidateSeconds: 300,
    timeoutMs: 8000,
    /** Optional: lets the panel push changes instantly via POST /api/about/revalidate. */
    revalidateSecret: process.env.ABOUT_REVALIDATE_SECRET ?? "",
  },
  ads: {
    /** JSON feed of banner links: { links: [{ id, type, value }] }. */
    feedUrl: process.env.ADS_FEED_URL ?? "https://ad-links.vercel.app/api/ads",
    /** How long the feed and each link's frame check are reused. */
    feedTtlMs: 5 * 60 * 1000,
    frameCheckTtlMs: 60 * 60 * 1000,
    timeoutMs: 5000,
  },
  quran: {
    /** Quran Foundation (authenticated) — used when credentials are present. */
    qfClientId: process.env.QF_CLIENT_ID ?? "",
    qfClientSecret: process.env.QF_CLIENT_SECRET ?? "",
    qfTokenUrl:
      process.env.QF_TOKEN_URL ?? "https://oauth2.quran.foundation/oauth2/token",
    qfApiBase:
      process.env.QF_API_BASE ?? "https://apis.quran.foundation/content/api/v4",
    /** Public Quran.com v4 API — fallback when no credentials are configured. */
    publicApiBase: process.env.QURAN_PUBLIC_API_BASE ?? "https://api.quran.com/api/v4",
    timeoutMs: Number(process.env.QURAN_TIMEOUT_MS ?? 10000),
    revalidateSeconds: 60 * 60 * 24,
  },
  push: {
    /** VAPID keys for Web Push (generate once: `npx web-push generate-vapid-keys`). */
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? "",
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? "",
    vapidSubject: process.env.VAPID_SUBJECT ?? "mailto:admin@labbaikguide.app",
    /** Upstash QStash delivers each reminder at its time (delayed message → /api/push/deliver). */
    qstashUrl: process.env.QSTASH_URL ?? "https://qstash.upstash.io",
    qstashToken: process.env.QSTASH_TOKEN ?? "",
    qstashCurrentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY ?? "",
    qstashNextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY ?? "",
    /** Public base URL QStash calls back; Vercel sets VERCEL_PROJECT_PRODUCTION_URL automatically. */
    siteUrl:
      process.env.PUSH_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "")),
  },
  routing: {
    /** OSRM-compatible base URL serving a foot profile. Default: FOSSGIS public router (fair use ≤1 req/s). */
    osrmUrl: process.env.ROUTING_OSRM_URL ?? "https://routing.openstreetmap.de/routed-foot",
    sourceName: process.env.ROUTING_SOURCE_NAME ?? "OSRM · FOSSGIS · © OpenStreetMap",
    sourceUrl: process.env.ROUTING_SOURCE_URL ?? "https://routing.openstreetmap.de/about.html",
    timeoutMs: 8000,
  },
  haramain: {
    /** "haramainimams" (default) | "custom" | "none" — see src/server/haramain/service.ts */
    provider: process.env.HARAMAIN_SCHEDULE_PROVIDER ?? "haramainimams",
    haramainImamsBase: process.env.HARAMAIN_IMAMS_BASE ?? "https://haramainimams.com",
    /**
     * Endpoint returning the official Imam/Muezzin schedule in the normalized
     * contract (see `src/server/haramain/schema.ts`). Leave empty until an
     * official source is integrated — the UI then shows "unavailable".
     */
    scheduleUrl: process.env.HARAMAIN_SCHEDULE_URL ?? "",
    scheduleApiKey: process.env.HARAMAIN_SCHEDULE_API_KEY ?? "",
    sourceName: process.env.HARAMAIN_SCHEDULE_SOURCE_NAME ?? "",
    timeoutMs: 8000,
    /** Staff changes rarely within a day; 2 min matches the source's own refresh. */
    revalidateSeconds: 120,
  },
} as const;

export const hasQuranFoundationCredentials = () =>
  Boolean(SERVER_CONFIG.quran.qfClientId && SERVER_CONFIG.quran.qfClientSecret);
