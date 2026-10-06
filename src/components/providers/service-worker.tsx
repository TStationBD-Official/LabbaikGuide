"use client";

import { useEffect } from "react";
import { getOfflineMeta, TOTAL_SURAHS } from "@/services/quran/offline";

const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
const PRECACHED_KEY = "hc-precached-build";

function readerPages() {
  return [
    ...Array.from({ length: TOTAL_SURAHS }, (_, i) => `/quran/surah/${i + 1}`),
    ...Array.from({ length: 30 }, (_, i) => `/quran/juz/${i + 1}`),
  ];
}

/**
 * Registers the offline service worker (production only). After each deploy,
 * asks it to re-cache every page so the offline copy matches the live app,
 * including the 144 reader pages when the Quran has been downloaded.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "precache-done" && e.data.scope === "core" && e.data.buildId === BUILD_ID) {
        try {
          localStorage.setItem(PRECACHED_KEY, BUILD_ID);
        } catch {
          /* ignore */
        }
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);

    const sync = async () => {
      const reg = await navigator.serviceWorker.ready;
      if (!navigator.onLine || !reg.active) return;
      let last: string | null = null;
      try {
        last = localStorage.getItem(PRECACHED_KEY);
      } catch {
        /* ignore */
      }
      if (last === BUILD_ID) return;
      reg.active.postMessage({ type: "precache-core", buildId: BUILD_ID });
      if (await getOfflineMeta()) reg.active.postMessage({ type: "precache-pages", urls: readerPages() });
    };

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(() => {
          // Defer so precaching never competes with the first render.
          setTimeout(() => void sync(), 4000);
        })
        .catch(() => {
          /* offline support is progressive — the app works without it */
        });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);
  return null;
}
