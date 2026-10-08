import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/app";

const ROUTES = ["/", "/quran", "/zikr", "/umrah", "/hajj", "/duas", "/prayer", "/qibla", "/hotel", "/tawaf", "/sai", "/manasik", "/settings", "/sources", "/privacy", "/about", "/haram-map", "/travel-guide", "/janazah"];

export default function sitemap(): MetadataRoute.Sitemap {
  const surahs = Array.from({ length: 114 }, (_, i) => `/quran/surah/${i + 1}`);
  return [...ROUTES, ...surahs].map((path) => ({
    url: `${APP_CONFIG.siteUrl}${path}`,
    changeFrequency: path.startsWith("/quran/") ? "yearly" : "weekly",
    priority: path === "/" ? 1 : path.startsWith("/quran/") ? 0.5 : 0.8,
  }));
}
