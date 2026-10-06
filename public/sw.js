/* LabbaikGuide service worker — full offline support.
 *
 * Strategies:
 *  - Static build assets (/_next/static), fonts, icons: cache-first (immutable).
 *  - Quran API (/api/quran/*): stale-while-revalidate (Quran text never changes).
 *  - Live data (/api/haramain, /api/time): network-only — never served stale as "live".
 *    (Imam/Muezzin photos under /api/haramain/photo are static images: cache-first.)
 *  - Page navigations: network-first → cached copy → /offline.html.
 *
 * Precaching: every app page (and the JS/CSS each page needs) is cached on
 * install and re-cached after each deploy (the page sends "precache-core" when
 * its build id changes). Reader pages for all 114 surahs + 30 juz are cached
 * when the user downloads the Quran for offline use ("precache-pages").
 */
const VERSION = "v3";
const STATIC = `hc-static-${VERSION}`;
const PAGES = `hc-pages-${VERSION}`;
const API = `hc-api-${VERSION}`;
const MAX_API_ENTRIES = 600;
const MAX_PAGE_ENTRIES = 400;

const CORE_PAGES = [
  "/", "/quran", "/quran/surah/1", "/zikr", "/manasik", "/umrah", "/hajj", "/tawaf", "/sai",
  "/duas", "/prayer", "/qibla", "/search", "/settings", "/sources", "/privacy",
];
const CORE_ASSETS = [
  "/offline.html", "/manifest.webmanifest", "/icons/icon.svg", "/icons/icon-192.png", "/icons/icon-512.png",
  "/fonts/quran/indopak-alqalam.ttf", "/fonts/quran/kfgqpc-uthmanic-hafs.otf", "/fonts/quran/amiri-quran.woff2",
  "/fonts/quran/scheherazade-new.woff2", "/fonts/quran/noto-naskh-arabic.woff2", "/fonts/quran/noto-nastaliq-urdu.woff2",
];

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

/** Cache a static asset if it is not cached yet. */
async function ensureAsset(url) {
  const cache = await caches.open(STATIC);
  if (await cache.match(url)) return;
  try {
    const res = await fetch(url);
    if (res.ok) await cache.put(url, res);
  } catch {
    /* offline or transient — will be cached on first use */
  }
}

/** Static assets referenced by a page: scripts, styles, and chunks named in the RSC payload. */
function assetsIn(html) {
  const found = new Set();
  for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) found.add(m[0]);
  for (const m of html.matchAll(/static\/(?:chunks|css|media)\/[^"'\s)\\]+/g)) found.add(`/_next/${m[0]}`);
  return [...found];
}

/** Font files from @font-face rules whose unicode-range covers Latin, Bengali or Arabic. */
function neededFonts(css) {
  const out = [];
  for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
    const range = (block.match(/unicode-range:\s*([^;}]+)/) || [])[1] || "";
    const wanted = !range || /U\+0000-00FF|U\+0980|U\+0600/i.test(range);
    if (!wanted) continue;
    for (const m of block.matchAll(/url\(([^)]+)\)/g)) {
      const u = m[1].replace(/["']/g, "");
      if (u.startsWith("/_next/static/media/") && u.endsWith(".woff2")) out.push(u);
    }
  }
  return out;
}

async function cachePage(url) {
  try {
    const res = await fetch(url, { credentials: "same-origin", cache: "no-store" });
    if (!res.ok || !(res.headers.get("content-type") || "").includes("text/html")) return false;
    const html = await res.clone().text();
    await (await caches.open(PAGES)).put(url, res);
    // CSS lists every font subset; cache only the ones this app needs offline
    // (Latin, Bengali, Arabic/Urdu), not Cyrillic/Greek/Vietnamese etc.
    for (const c of assets.filter((a) => a.endsWith(".css"))) {
      const r = await caches.match(c);
      if (r) await Promise.all(neededFonts(await r.text()).map(ensureAsset));
    }
    return true;
  } catch {
    return false;
  }
}

async function precache(urls) {
  let ok = 0;
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (queue.length) if (await cachePage(queue.shift())) ok++;
    }),
  );
  await trim(PAGES, MAX_PAGE_ENTRIES);
  return ok;
}

async function notify(message) {
  for (const client of await self.clients.matchAll({ includeUncontrolled: true })) client.postMessage(message);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC);
      await Promise.allSettled(CORE_ASSETS.map((a) => cache.add(a)));
      await precache(CORE_PAGES);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("hc-") && !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "precache-core") {
    event.waitUntil(precache(CORE_PAGES).then((count) => notify({ type: "precache-done", scope: "core", count, buildId: data.buildId })));
  } else if (data.type === "precache-pages" && Array.isArray(data.urls)) {
    const urls = data.urls.filter((u) => typeof u === "string" && u.startsWith("/") && !u.startsWith("//")).slice(0, 300);
    event.waitUntil(precache(urls).then((count) => notify({ type: "precache-done", scope: "pages", count })));
  } else if (data.type === "status") {
    event.waitUntil(
      caches.open(PAGES).then(async (c) => {
        const keys = await c.keys();
        const paths = keys.map((k) => new URL(k.url).pathname);
        notify({ type: "status", pages: paths.length, core: CORE_PAGES.every((p) => paths.includes(p)) });
      }),
    );
  }
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) (await caches.open(STATIC)).put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(API);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok) {
        cache.put(req, res.clone());
        trim(API, MAX_API_ENTRIES);
      }
      return res;
    })
    .catch(() => undefined);
  return (
    cached ||
    (await network) ||
    new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "content-type": "application/json" } })
  );
}

async function networkFirstPage(req) {
  const cache = await caches.open(PAGES);
  const url = new URL(req.url);
  try {
    const res = await fetch(req);
    if (res.ok && res.type === "basic") {
      cache.put(url.pathname, res.clone());
      trim(PAGES, MAX_PAGE_ENTRIES);
    }
    return res;
  } catch {
    return (
      (await cache.match(url.pathname)) ||
      (await cache.match(req, { ignoreSearch: true })) ||
      (await caches.match("/offline.html"))
    );
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Photos are static images: cache-first so they also show offline (they are never "live" data).
  if (url.pathname === "/api/haramain/photo") return event.respondWith(cacheFirst(req));
  if (url.pathname.startsWith("/api/haramain") || url.pathname.startsWith("/api/time")) return; // network-only
  if (url.pathname.startsWith("/api/quran/")) return event.respondWith(staleWhileRevalidate(req));
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/fonts/") ||
    /\.(woff2?|ttf|otf)$/.test(url.pathname)
  ) {
    return event.respondWith(cacheFirst(req));
  }
  if (req.mode === "navigate") return event.respondWith(networkFirstPage(req));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => "focus" in c);
      return open ? open.focus() : self.clients.openWindow("/prayer");
    }),
  );
});
