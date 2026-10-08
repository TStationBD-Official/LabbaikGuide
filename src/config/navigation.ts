import {
  BookOpen,
  Compass,
  Clock,
  HandHeart,
  Home,
  Info,
  LayoutGrid,
  Repeat,
  Search,
  Settings,
  Shield,
  CircleDot,
  Footprints,
  Landmark,
  Hotel,
  Map,
  type LucideIcon,
} from "lucide-react";
import type { TKey } from "@/i18n";

export type NavItem = {
  href: string;
  labelKey: TKey;
  /** Short label for the navigation rail (falls back to labelKey). */
  shortKey?: TKey;
  icon: LucideIcon;
  match?: (p: string) => boolean;
};

const starts = (prefix: string) => (p: string) => p === prefix || p.startsWith(`${prefix}/`);

/** Bottom navigation on phones — 5 primary destinations. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: Home, match: (p) => p === "/" },
  { href: "/quran", labelKey: "nav.quran", icon: BookOpen, match: starts("/quran") },
  { href: "/zikr", labelKey: "nav.zikr", icon: Repeat, match: starts("/zikr") },
  {
    href: "/manasik",
    labelKey: "nav.manasik",
    icon: Landmark,
    match: (p) => ["/manasik", "/umrah", "/hajj", "/tawaf", "/sai"].some((x) => starts(x)(p)),
  },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/haram-map", labelKey: "nav.haramMap", shortKey: "nav.short.haramMap", icon: Map, match: starts("/haram-map") },
  { href: "/hotel", labelKey: "nav.hotel", shortKey: "nav.short.hotel", icon: Hotel, match: starts("/hotel") },
  { href: "/duas", labelKey: "nav.duas", icon: HandHeart, match: starts("/duas") },
  { href: "/prayer", labelKey: "nav.prayer", shortKey: "nav.short.prayer", icon: Clock, match: starts("/prayer") },
  { href: "/qibla", labelKey: "nav.qibla", icon: Compass, match: starts("/qibla") },
  { href: "/tawaf", labelKey: "nav.tawaf", shortKey: "nav.short.tawaf", icon: CircleDot, match: starts("/tawaf") },
  { href: "/sai", labelKey: "nav.sai", shortKey: "nav.short.sai", icon: Footprints, match: starts("/sai") },
  { href: "/search", labelKey: "nav.search", icon: Search, match: starts("/search") },
  { href: "/settings", labelKey: "nav.settings", icon: Settings, match: starts("/settings") },
];

export const FOOTER_NAV: NavItem[] = [
  { href: "/sources", labelKey: "nav.sources", icon: Info },
  { href: "/privacy", labelKey: "nav.privacy", icon: Shield },
];

export const MORE_ICON = LayoutGrid;
