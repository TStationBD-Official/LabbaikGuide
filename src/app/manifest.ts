import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app";

export default function manifest(): MetadataRoute.Manifest {
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
    theme_color: "#0f5c45",
    lang: "bn",
    dir: "auto",
    categories: ["lifestyle", "education", "travel"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcuts: [
      { name: "Quran", url: "/quran", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Zikr", url: "/zikr", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Prayer", url: "/prayer", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
