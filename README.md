# Haramain Companion · হারামাইন কম্প্যানিয়ন

A production-grade, mobile-first Umrah & Hajj companion: Quran reader (IndoPak/Uthmani, Bangla translation & tafsir), zikr counter, Tawaf & Sa'i counters, Umrah and Hajj guides, a sourced dua library, Haram prayer times, Qibla and Hijri dates — in Bangla, English, Arabic and Urdu.

> **Religious accuracy over visual effects.** Nothing religious is invented. Every dua and guide step carries a Quran/hadith reference; scholarly differences are labelled; live data that cannot be confirmed is shown as unavailable — never guessed.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything is optional
npm run dev                  # http://localhost:3000
npm run check                # lint → typecheck → tests → production build
```

Requires Node 20.9+ (tested on Node 22).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Zustand · TanStack Query (+ IndexedDB persistence) · Zod · Motion · Lucide · `adhan` · Vitest + Testing Library. Fonts are self-hosted via `@fontsource` (works offline, no Google Fonts requests).

## Architecture

```
Browser ──► /api/quran/*  (Next route handlers: rate limit → Zod-validate query → upstream → Zod-validate → sanitize → normalize)
                          └─► Quran Foundation API (OAuth2, server-only secrets) or public Quran.com v4 API
Browser ──► /api/haramain/schedule ──► haramainScheduleService ──► official adapter (env-configured) ──► normalized model
Prayer times: computed on-device with `adhan` (Umm al-Qura) for the Haram coordinates → works offline.
```

```
src/
  app/                 routes (pages + API route handlers, manifest, sitemap, robots, OG image)
  components/
    ui/                design-system primitives (Button, Card, Sheet, SegmentedControl, Toggle, Progress, CircularProgress, …)
    layout/            AppShell (sidebar / bottom nav / More sheet), selectors, install prompt, notifier
    quran/ zikr/ prayer/ manasik/ dua/ home/ settings/ search/
    providers/         preferences (cookie), i18n, TanStack Query (IndexedDB persister), service worker
  config/              app config, server-only config, locations registry, navigation
  data/                sourced religious content (duas, Umrah steps, Hajj stages, default zikr)
  features/            pure, unit-tested logic (zikr, tawaf/sa'i, prayer/calendar/qibla, local search)
  i18n/                bn/en/ar/ur dictionaries + typed `t()` (typos fail type-checking)
  server/              server-only: Quran upstream + OAuth, service, sanitizer, rate limiter, Haramain service
  services/            browser API client (typed errors), query hooks, IndexedDB storage
  stores/              Zustand stores (local-first, persisted to IndexedDB)
  types/               Zod schemas + TS types for normalized models
  proxy.ts             per-request CSP nonce (Next 16 “proxy”, formerly middleware)
public/sw.js           service worker (offline)
tests/                 Vitest unit + component tests
```

### State separation
| Kind | Where | Examples |
|---|---|---|
| Appearance prefs | cookie `hc_prefs` (read by the server → no flash) | theme, language, fonts, text size, location |
| Persistent local data | Zustand + IndexedDB | zikr counts/history, bookmarks, last-read, favourites, Umrah/Hajj progress |
| Server state | TanStack Query (memory → IndexedDB → API) | Quran verses, translations, tafsir; Haramain schedule (not persisted) |

Query keys include language, translation id, tafsir id and word-mode, so one language's cached text can never appear under another.

## Haramain schedule (Imam / Muezzin)

`src/server/haramain/service.ts` has pluggable providers, chosen with `HARAMAIN_SCHEDULE_PROVIDER`:

| Provider | Source |
|---|---|
| `haramainimams` (default) | Public JSON feed behind [haramainimams.com](https://haramainimams.com) (`/api/prayers/{mecca|madinah}`), fetched server-side every 2 min |
| `custom` | Your own service at `HARAMAIN_SCHEDULE_URL` returning `{ date, location, prayers: [{ name, imam, muezzin, adhan?, iqamah? }] }` |
| `none` | Always "unavailable" |

Only entries for **today's Riyadh date** are used; anything that fails validation becomes *“ইমামের সময়সূচি এখন নিশ্চিতভাবে পাওয়া যাচ্ছে না।”*. Names are never invented and missing ones stay `null`. Adhan times remain the calculated Umm al-Qura times. haramainimams.com is a third-party site, not an official API, so ask its operators for permission before relying on it publicly; switching provider is one env var.

## Security
- Secrets only in server env (`src/config/server.ts` imports `server-only`; the build fails if a client component imports it).
- All upstream JSON is Zod-validated; translation/tafsir HTML is sanitized server-side to formatting tags with **no attributes**.
- Strict CSP with per-request nonce (`src/proxy.ts`), HSTS, `X-Frame-Options: DENY`, restrictive `Permissions-Policy`.
- Per-IP token-bucket rate limit on API routes (in-memory; swap for Redis/Upstash on multi-instance deployments).
- User-entered zikr text is length-validated and rendered as text, never HTML.

## Privacy
No accounts, no ads, analytics off by default. Location is used only for Qibla, on-device. See `/privacy`.

## Content review
Guides and duas are compiled from the cited sources and **must be reviewed by a qualified scholar before public launch**. Explanatory content is authored in Bangla and English; Arabic/Urdu UIs show English explanations alongside the original Arabic.

## Known limitations / next steps
- Imam/Muezzin data depends on a third-party feed (see above); seek permission or an official feed.
- Prayer/zikr notifications fire while the app is open (no push server).
- Tajweed colour-coded script not yet enabled (needs `text_uthmani_tajweed` rendering + sanitizer allow-list).
- IndoPak renders with Noto Naskh / Noto Nastaliq; for a print-mushaf look, add a dedicated IndoPak font file to `public/fonts`.
