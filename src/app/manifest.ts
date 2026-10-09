import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app";

/** Lets Android show "Labbaik Guide" in the share sheet (e.g. Google Maps → Share) once the app is installed. */
type WithShareTarget = MetadataRoute.Manifest & {
  share_target: { action: string; method: "GET"; params: { title?: string; text?: string; url?: string } };
};

export default function manifest(): WithShareTarget {
  return {
    name: APP_CONFIG.name,
    short_name: APP_CONFIG.shortName,
    description: APP_CONFIG.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f3ea",
    theme_color: "#fdfaf4",
    lang: "bn",
    dir: "auto",
    categories: ["lifestyle", "education", "travel"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    share_target: { action: "/hotel", method: "GET", params: { title: "share_title", text: "share_text", url: "share_url" } },
    shortcuts: [
      { name: "Quran", url: "/quran", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Zikr", url: "/zikr", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Prayer", url: "/prayer", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
