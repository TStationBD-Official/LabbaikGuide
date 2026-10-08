/* LabbaikGuide service worker — full offline support.
 *
 * Strategies:
 *  - Static build assets (/_next/static), fonts, icons: cache-first (immutable).
 *  - Quran API (/api/quran/*): stale-while-revalidate (Quran text never changes).
 *  - Live data (/api/haramain, /api/time): network-only — never served stale as "live".
 *    (Imam/Muezzin photos under /api/haramain/photo are static images: cache-first.)
 *  - About us (/api/about): network-first → last saved copy offline (panel data can change anytime).
 *    Its images (/api/about/image): cache-first — every new upload gets a new URL.
 *  - Page navigations: network-first → cached copy → /offline.html.
 *
 * Precaching: every app page (and the JS/CSS each page needs) is cached on
 * install and re-cached after each deploy (the page sends "precache-core" when
 * its build id changes). Reader pages for all 114 surahs + 30 juz are cached
 * when the user downloads the Quran for offline use ("precache-pages").
 */
const VERSION = "v5";
const STATIC = `hc-static-${VERSION}`;
const PAGES = `hc-pages-${VERSION}`;
const API = `hc-api-${VERSION}`;
const MAX_API_ENTRIES = 600;
const MAX_PAGE_ENTRIES = 400;
/** Map tiles survive SW updates (not versioned); capped so storage stays modest. */
const TILES = "hc-tiles";
/** Mushaf page fonts (immutable): kept across versions, capped. */
const QCF = "hc-qcf";
const MAX_QCF_ENTRIES = 1300;
const MAX_TILE_ENTRIES = 4000;
/** About-page images (a new URL per upload, so never stale): kept across versions, capped. */
const ABOUT_IMG = "hc-about-img";
const MAX_ABOUT_IMG_ENTRIES = 150;
const TILE_HOSTS = ["tiles.openfreemap.org", "tile.openstreetmap.org"];

const CORE_PAGES = [
  "/", "/quran", "/quran/surah/1", "/zikr", "/manasik", "/umrah", "/hajj", "/tawaf", "/sai",
  "/duas", "/prayer", "/qibla", "/hotel", "/search", "/settings", "/sources", "/privacy", "/about",
];
const CORE_ASSETS = [
  "/vendor/maplibre-gl-csp-worker.js",
  "/offline.html", "/manifest.webmanifest", "/icons/icon.svg", "/icons/icon-192.png", "/icons/icon-512.png",
  "/fonts/quran/indopak-alqalam.ttf", "/fonts/quran/kfgqpc-hafs-v18.woff2", "/fonts/quran/amiri-quran.woff2",
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
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("hc-") && k !== TILES && k !== QCF && k !== ABOUT_IMG && !k.endsWith(VERSION)).map((k) => caches.delete(k))))
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
  } else if (data.type === "cache-tiles" && Array.isArray(data.urls)) {
    // Small area around the saved hotel so the map also works offline (no bulk downloads).
    const urls = data.urls
      .filter((u) => typeof u === "string" && TILE_HOSTS.includes(safeHost(u)))
      .slice(0, 400);
    event.waitUntil(cacheTiles(urls));
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

function safeHost(u) {
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
}

async function cacheTiles(urls) {
  const cache = await caches.open(TILES);
  const queue = [...urls];
  const worker = async () => {
    while (queue.length) {
      const u = queue.shift();
      if (await cache.match(u)) continue;
      try {
        const res = await fetch(u, { mode: "cors", credentials: "omit" });
        if (res.ok) await cache.put(u, res);
      } catch {
        /* offline or blocked — try again next time */
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  await trim(TILES, MAX_TILE_ENTRIES);
}

/** Map data: tiles, fonts and sprites cache-first; style/TileJSON documents stale-while-revalidate. */
async function mapRequest(req) {
  const cache = await caches.open(TILES);
  const url = new URL(req.url);
  const isDoc = url.pathname.startsWith("/styles/") || /^\/[a-z0-9_-]+$/i.test(url.pathname);
  const cached = await cache.match(req.url);
  if (cached && !isDoc) return cached;
  const network = fetch(req)
    .then((res) => {
      if (res.ok) {
        cache.put(req.url, res.clone());
        trim(TILES, MAX_TILE_ENTRIES);
      }
      return res;
    })
    .catch(() => undefined);
  if (cached) return cached;
  return (await network) || new Response("", { status: 504 });
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) (await caches.open(STATIC)).put(req, res.clone());
  return res;
}

async function qcfFont(req) {
  const cache = await caches.open(QCF);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    await cache.put(req, res.clone());
    trim(QCF, MAX_QCF_ENTRIES);
  }
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

async function networkFirstApi(req) {
  const cache = await caches.open(API);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return (
      (await cache.match(req)) ||
      new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "content-type": "application/json" } })
    );
  }
}

async function aboutImage(req) {
  const cache = await caches.open(ABOUT_IMG);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    await cache.put(req, res.clone());
    trim(ABOUT_IMG, MAX_ABOUT_IMG_ENTRIES);
  }
  return res;
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
  if (TILE_HOSTS.includes(url.hostname)) return event.respondWith(mapRequest(req));
  if (url.origin !== self.location.origin) return;

  // Photos are static images: cache-first so they also show offline (they are never "live" data).
  if (url.pathname === "/api/haramain/photo") return event.respondWith(cacheFirst(req));
  if (url.pathname.startsWith("/api/haramain") || url.pathname.startsWith("/api/time")) return; // network-only
  if (url.pathname.startsWith("/api/quran/")) return event.respondWith(staleWhileRevalidate(req));
  if (url.pathname === "/api/about/image") return event.respondWith(aboutImage(req));
  if (url.pathname === "/api/about") return event.respondWith(networkFirstApi(req));
  if (url.pathname.startsWith("/qcf/")) return event.respondWith(qcfFont(req));
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/vendor/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/data/riwayat/") ||
    url.pathname.startsWith("/data/bn-uccharon/") ||
    /\.(woff2?|ttf|otf)$/.test(url.pathname)
  ) {
    return event.respondWith(cacheFirst(req));
  }
  if (req.mode === "navigate") return event.respondWith(networkFirstPage(req));
});

// Background reminders (Web Push). Payload: { title, body, url, tag }.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Labbaik", body: event.data ? event.data.text() : "" };
  }
  const url = typeof data.url === "string" && data.url.startsWith("/") && !data.url.startsWith("//") ? data.url : "/zikr";
  event.waitUntil(
    self.registration.showNotification(String(data.title || "Labbaik").slice(0, 80), {
      body: String(data.body || "").slice(0, 240),
      tag: String(data.tag || "reminder").slice(0, 64),
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/prayer";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (list) => {
      const win = list.find((c) => "focus" in c);
      if (win) {
        await win.focus();
        if ("navigate" in win) return win.navigate(target).catch(() => undefined);
        return undefined;
      }
      return self.clients.openWindow(target);
    }),
  );
});
