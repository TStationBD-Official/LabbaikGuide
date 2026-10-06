"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Languages, Moon, PanelLeftClose, PanelLeftOpen, Search, Settings, Sun } from "lucide-react";
import { FOOTER_NAV, MORE_ICON, PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "@/config/navigation";
import { useI18n } from "@/components/providers/i18n-provider";
import { usePrefs } from "@/components/providers/preferences-provider";
import { LOCALE_NAMES } from "@/i18n";
import { LOCALES, type Locale } from "@/lib/preferences";
import { useOnline } from "@/hooks/use-online";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "./logo";
import { AccentSelector, LanguageSelector, LocationSwitcher } from "./selectors";
import { InstallPrompt } from "./install-prompt";
import { Notifier } from "./notifier";
import { ThemeColorSync } from "./theme-color-sync";

function isActive(item: NavItem, path: string) {
  return item.match ? item.match(path) : path === item.href;
}

function OfflineBanner() {
  const online = useOnline();
  const { t } = useI18n();
  if (online) return null;
  return (
    <div role="status" className="sticky top-0 z-50 bg-secondary px-4 py-2 text-center text-sm text-secondary-foreground">
      <strong className="font-semibold">{t("common.offline")}</strong>
      <span className="ms-2 opacity-80">{t("common.offlineDesc")}</span>
    </div>
  );
}

function SidebarLink({ item, path }: { item: NavItem; path: string }) {
  const { t } = useI18n();
  const active = isActive(item, path);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/80 hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-[1.15rem] shrink-0" aria-hidden />
      <span className="truncate">{t(item.labelKey)}</span>
    </Link>
  );
}

const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

/**
 * Adaptive navigation, following Material / Flutter window-size classes:
 *  - compact  (< 768px):  top bar + bottom navigation bar
 *  - medium   (768–1279): navigation rail
 *  - expanded (≥ 1280):   navigation drawer, collapsible to the rail
 */
function NavDrawer({ path, collapsed, onCollapse }: { path: string; collapsed: boolean; onCollapse: () => void }) {
  const { t } = useI18n();
  return (
    <aside
      className={cn(
        "sticky top-0 h-dvh w-72 shrink-0 flex-col border-e border-border/70 bg-card/40 px-4 pb-5 backdrop-blur",
        collapsed ? "hidden" : "hidden xl:flex",
      )}
    >
      {/* Same height as the top app bar so the two line up. */}
      <div className="-mx-4 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/60 px-4">
        <Logo />
        <button
          type="button"
          onClick={onCollapse}
          aria-label={t("nav.collapse")}
          title={t("nav.collapse")}
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <PanelLeftClose className="size-[1.15rem] rtl:-scale-x-100" aria-hidden />
        </button>
      </div>
      <nav aria-label={t("nav.mainNav")} className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto">
        {ALL_NAV.map((item) => (
          <SidebarLink key={item.href} item={item} path={path} />
        ))}
      </nav>
      <div className="gold-rule my-3" aria-hidden />
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
        {FOOTER_NAV.map((f) => (
          <Link key={f.href} href={f.href} className="hover:text-foreground">
            {t(f.labelKey)}
          </Link>
        ))}
      </div>
    </aside>
  );
}

function NavRail({ path, collapsed, onExpand }: { path: string; collapsed: boolean; onExpand: () => void }) {
  const { t } = useI18n();
  return (
    <aside
      className={cn(
        "sticky top-0 h-dvh w-[5.5rem] shrink-0 flex-col items-center border-e border-border/70 bg-card/40 pb-2 backdrop-blur",
        collapsed ? "hidden md:flex" : "hidden md:flex xl:hidden",
      )}
    >
      <Link href="/" aria-label={t("app.name")} className="flex h-16 w-full shrink-0 items-center justify-center border-b border-border/60">
        <LogoMark className="size-10" />
      </Link>
      {/* Expanding only makes sense where the drawer fits. */}
      <button
        type="button"
        onClick={onExpand}
        aria-label={t("nav.expand")}
        title={t("nav.expand")}
        className={cn(
          "mt-2 size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed ? "hidden xl:grid" : "hidden",
        )}
      >
        <PanelLeftOpen className="size-[1.15rem] rtl:-scale-x-100" aria-hidden />
      </button>
      <nav aria-label={t("nav.mainNav")} className="mt-2 flex w-full flex-1 flex-col items-stretch gap-1 overflow-y-auto px-1.5 pb-2">
        {ALL_NAV.map((item) => {
          const active = isActive(item, path);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={t(item.labelKey)}
              className="group flex flex-col items-center gap-1 rounded-xl py-1.5 text-center"
            >
              <span
                className={cn(
                  "grid h-8 w-14 place-items-center rounded-full transition-colors",
                  active ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/75 group-hover:bg-muted group-hover:text-foreground",
                )}
              >
                <Icon className="size-[1.2rem]" aria-hidden strokeWidth={active ? 2.3 : 1.9} />
              </span>
              <span className={cn("line-clamp-1 w-full px-0.5 text-[0.68rem] leading-tight", active ? "font-semibold text-primary" : "text-muted-foreground")}>
                {t(item.shortKey ?? item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/** Top app bar on tablets and desktops: search, Makkah/Madinah (Home only), theme and language. */
function DesktopTopBar({ path }: { path: string }) {
  const { t, locale, setLocale } = useI18n();
  const theme = usePrefs((s) => s.theme);
  const set = usePrefs((s) => s.set);
  const osDark = useOsDark();
  const dark = theme === "dark" || theme === "contrast" || (theme === "system" && osDark);
  return (
    <header className="glass sticky top-0 z-40 hidden h-16 items-center gap-3 border-b border-border/60 px-6 md:flex lg:px-8">
      <div className="min-w-0 flex-1">
        {/* Makkah/Madinah switch only on Home (Settings has its own). */}
        {path === "/" ? <LocationSwitcher size="sm" className="max-w-xs" /> : null}
      </div>
      <Link
        href="/search"
        className="flex h-10 w-full max-w-sm items-center gap-2.5 rounded-full border border-border bg-card/80 ps-4 pe-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 truncate">{t("nav.searchHint")}</span>
        <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-[0.7rem] lg:inline">/</kbd>
      </Link>
      <label className="sr-only" htmlFor="topbar-lang">
        {t("language.label")}
      </label>
      <div className="relative">
        <Languages className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <select
          id="topbar-lang"
          value={locale}
          onChange={(e) => void setLocale(e.target.value as Locale)}
          className="h-10 appearance-none rounded-full border border-border bg-card/80 ps-9 pe-4 text-sm text-foreground hover:border-primary/40"
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {LOCALE_NAMES[l]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => set({ theme: dark ? "light" : "dark" })}
        aria-label={t("nav.toggleTheme")}
        title={t("nav.toggleTheme")}
        className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card/80 text-foreground/80 hover:border-primary/40 hover:text-foreground"
      >
        {dark ? <Sun className="size-[1.1rem]" aria-hidden /> : <Moon className="size-[1.1rem]" aria-hidden />}
      </button>
      <Link
        href="/settings"
        aria-label={t("nav.settings")}
        title={t("nav.settings")}
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full border transition-colors",
          path.startsWith("/settings") ? "border-primary bg-primary-soft text-primary" : "border-border bg-card/80 text-foreground/80 hover:border-primary/40 hover:text-foreground",
        )}
      >
        <Settings className="size-[1.1rem]" aria-hidden />
      </Link>
    </header>
  );
}

const DARK_MQ = "(prefers-color-scheme: dark)";
function useOsDark() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(DARK_MQ);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(DARK_MQ).matches,
    () => false,
  );
}

/** "/" or Ctrl/⌘+K opens search on keyboards. */
function useSearchShortcut() {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey)) {
        e.preventDefault();
        router.push("/search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}

function MobileHeader({ path }: { path: string }) {
  const { t } = useI18n();
  return (
    <header className="glass sticky top-0 z-40 border-b border-border/60 px-4 pb-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] md:hidden">
      <div className="flex items-center justify-between gap-3">
        <Logo />
        <Link
          href="/search"
          aria-label={t("nav.search")}
          className="grid size-11 place-items-center rounded-full border border-border bg-card/70"
        >
          <Search className="size-5" aria-hidden />
        </Link>
      </div>
      {/* Makkah/Madinah switch only on Home (Settings has its own). */}
      {path === "/" ? (
        <div className="mt-2.5">
          <LocationSwitcher size="sm" />
        </div>
      ) : null}
    </header>
  );
}

function BottomNav({ path, onMore }: { path: string; onMore: () => void }) {
  const { t } = useI18n();
  const moreActive = SECONDARY_NAV.some((i) => isActive(i, path)) || FOOTER_NAV.some((i) => isActive(i, path));
  const itemCls = (active: boolean) =>
    cn(
      "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground",
    );
  return (
    <nav
      aria-label={t("nav.mainNav")}
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/60 safe-bottom md:hidden"
    >
      <ul className="mx-auto flex max-w-xl">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(item, path);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex flex-1">
              <Link href={item.href} aria-current={active ? "page" : undefined} className={itemCls(active)}>
                {active ? <span aria-hidden className="absolute top-0 h-0.5 w-8 rounded-full bg-gold" /> : null}
                <Icon className="size-[1.35rem]" aria-hidden strokeWidth={active ? 2.3 : 1.8} />
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button type="button" onClick={onMore} className={itemCls(moreActive)} aria-haspopup="dialog">
            <MORE_ICON className="size-[1.35rem]" aria-hidden />
            {t("nav.more")}
          </button>
        </li>
      </ul>
    </nav>
  );
}

function MoreSheet({ open, onClose, path }: { open: boolean; onClose: () => void; path: string }) {
  const { t } = useI18n();
  return (
    <Sheet open={open} onClose={onClose} title={t("nav.more")}>
      <nav aria-label={t("nav.more")}>
        <ul className="grid auto-rows-fr grid-cols-3 gap-2">
          {[...SECONDARY_NAV, ...FOOTER_NAV].map((item) => {
            const Icon = item.icon;
            const active = isActive(item, path);
            return (
              <li key={item.href} className="h-full">
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full min-h-20 flex-col items-center justify-start gap-1.5 rounded-2xl border p-2 text-center text-xs font-medium",
                    active ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <Icon className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
                  <span className="line-clamp-2 min-h-[2lh] leading-tight">{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-5">
        <p className="mb-2 text-sm font-medium">{t("language.label")}</p>
        <LanguageSelector compact />
      </div>
      <div className="mt-5">
        <AccentSelector />
      </div>
    </Sheet>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  const { t } = useI18n();
  const [moreOpen, setMoreOpen] = useState(false);
  const collapsed = usePrefs((s) => s.navCollapsed);
  const setPrefs = usePrefs((s) => s.set);
  useSearchShortcut();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {t("app.skipToContent")}
      </a>
      <div className="app-backdrop" aria-hidden />
      <OfflineBanner />
      <div className="flex min-h-dvh">
        <NavRail path={path} collapsed={collapsed} onExpand={() => setPrefs({ navCollapsed: false })} />
        <NavDrawer path={path} collapsed={collapsed} onCollapse={() => setPrefs({ navCollapsed: true })} />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader path={path} />
          <DesktopTopBar path={path} />
          <main
            id="main"
            tabIndex={-1}
            className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 outline-none sm:px-6 md:pb-12 md:pt-7 lg:px-8 xl:max-w-6xl 2xl:max-w-7xl"
          >
            {children}
          </main>
        </div>
      </div>
      <BottomNav path={path} onMore={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} path={path} />
      <InstallPrompt />
      <Notifier />
      <ThemeColorSync />
    </>
  );
}
