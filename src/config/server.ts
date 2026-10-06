import "server-only";

/**
 * Server-only configuration. These values must never reach the browser bundle.
 * `server-only` makes the build fail if a client component imports this file.
 */
export const SERVER_CONFIG = {
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
  haramain: {
    /**
     * Endpoint returning the official Imam/Muezzin schedule in the normalized
     * contract (see `src/server/haramain/schema.ts`). Leave empty until an
     * official source is integrated — the UI then shows "unavailable".
     */
    scheduleUrl: process.env.HARAMAIN_SCHEDULE_URL ?? "",
    scheduleApiKey: process.env.HARAMAIN_SCHEDULE_API_KEY ?? "",
    sourceName: process.env.HARAMAIN_SCHEDULE_SOURCE_NAME ?? "",
    timeoutMs: 8000,
    revalidateSeconds: 60 * 15,
  },
} as const;

export const hasQuranFoundationCredentials = () =>
  Boolean(SERVER_CONFIG.quran.qfClientId && SERVER_CONFIG.quran.qfClientSecret);
