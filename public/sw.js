/* Haramain Companion service worker — offline support.
 *
 * Strategies:
 *  - Static build assets, fonts, icons: cache-first (immutable, hashed).
 *  - Quran API (/api/quran/*): stale-while-revalidate — Quran text never changes.
 *  - Live data (/api/haramain, /api/time): network-only. Never served stale as "live".
 *  - Page navigations: network-first, falling back to the last cached copy,
 *    then to /offline.html.
 */
const VERSION = "v2";
const STATIC = `hc-static-${VERSION}`;
const PAGES = `hc-pages-${VERSION}`;
const API = `hc-api-${VERSION}`;
const PRECACHE = ["/offline.html", "/icons/icon-192.png", "/icons/icon.svg", "/manifest.webmanifest"];
const MAX_API_ENTRIES = 400;
const MAX_PAGE_ENTRIES = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("hc-") && !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

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
  return cached || (await network) || new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "content-type": "application/json" } });
}

async function networkFirstPage(req) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(req);
    if (res.ok && res.type === "basic") {
      cache.put(req, res.clone());
      trim(PAGES, MAX_PAGE_ENTRIES);
    }
    return res;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) || (await caches.match("/offline.html"));
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/haramain") || url.pathname.startsWith("/api/time")) return; // network-only
  if (url.pathname.startsWith("/api/quran/")) return event.respondWith(staleWhileRevalidate(req));
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || /\.(woff2?|ttf|otf)$/.test(url.pathname)) {
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
